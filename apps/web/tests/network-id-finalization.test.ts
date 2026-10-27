import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { FinalizationService } from '../src/modules/checkout/finalization.service';
import { NetworkService } from '../src/modules/network/network.service';
import { CommissionsService } from '../src/modules/commissions/commissions.service';
import { CommissionSummaryService } from '../src/modules/commissions/commission-summary.service';
import { ProviderFactory } from '../src/modules/providers/provider.factory';
import { PaymentProvider } from '../src/modules/providers/interfaces/payment-provider.interface';
import { prisma } from '../src/lib/db';
import { BadRequestError, ForbiddenError } from '../src/lib/errors';
import { validateEnvironment, resetEnvForTesting } from '../src/lib/env';
import { POST as simulatePaymentRoute } from '../src/app/api/v1/dev/payments/[paymentId]/simulate/route';

describe('Network ID Creation & Finalization Lifecycle (11 Scenarios)', () => {
  beforeEach(() => {
    ProviderFactory.reset();
    resetEnvForTesting();
    vi.restoreAllMocks();
    vi.spyOn(CommissionsService, 'allocateCommissionsForOrder').mockResolvedValue([] as any);
    vi.spyOn(CommissionSummaryService, 'initializeSummariesForNetwork').mockResolvedValue();
  });

  afterEach(() => {
    ProviderFactory.reset();
    resetEnvForTesting();
    vi.restoreAllMocks();
  });

  // 1. Successful mock payment creates User & NetworkId
  it('1. Successful mock payment creates User & NetworkId', async () => {
    const mockOrder = {
      id: 'order-uuid-success-1',
      orderNumber: 'TS-1001-ABCD',
      status: 'PENDING_PAYMENT',
      paymentStatus: 'INITIATED',
      purpose: 'INITIAL_REGISTRATION',
      totalAmountPaise: BigInt(50000),
      currency: 'INR',
      customerName: 'Aarav Patel',
      customerPhone: '+919876543210',
      customerEmail: 'aarav@example.com',
      intendedParentNetworkId: 'root-node-uuid',
      payments: [
        {
          id: 'pay-uuid-1',
          merchantOrderId: 'TXN_TEST_1001',
          amountPaise: BigInt(50000),
          currency: 'INR',
          status: 'INITIATED',
        },
      ],
      checkoutSession: null,
    };

    const mockParentNode = {
      id: 'root-node-uuid',
      publicId: 'TS-ROOT-001',
      referralCode: 'TSROOT',
      status: 'ACTIVE',
      placementDepth: 0,
    };

    const mockCreatedUser = {
      id: 'user-uuid-1',
      fullName: 'Aarav Patel',
      phoneE164: '+919876543210',
      status: 'ACTIVE',
    };

    const mockCreatedNetworkId = {
      id: 'net-uuid-1',
      publicId: 'TS-NODE-001',
      referralCode: 'TSAARAV1',
      placementDepth: 1,
      ownerUserId: 'user-uuid-1',
      status: 'ACTIVE',
    };

    vi.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);

    // Mock successful provider response
    const mockSuccessProvider: PaymentProvider = {
      name: 'mock',
      createPayment: vi.fn(),
      getPaymentStatus: vi.fn().mockResolvedValue({
        status: 'SUCCESS',
        providerReference: 'MOCK-PAY-1001',
        amountPaise: 50000,
        currency: 'INR',
        isTestMode: true,
      }),
    };
    ProviderFactory.setCustomPaymentProvider(mockSuccessProvider);

    // Mock $transaction
    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
      const tx = {
        order: {
          findUniqueOrThrow: vi.fn().mockResolvedValue(mockOrder),
          update: vi.fn().mockResolvedValue({
            ...mockOrder,
            status: 'CONFIRMED',
            paymentStatus: 'SUCCESS',
            userId: mockCreatedUser.id,
            networkIdId: mockCreatedNetworkId.id,
          }),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue(mockCreatedUser),
        },
        networkId: {
          findFirst: vi.fn().mockResolvedValue(null),
          findUnique: vi.fn().mockResolvedValue(mockParentNode),
          create: vi.fn().mockResolvedValue(mockCreatedNetworkId),
        },
        networkPlacement: {
          create: vi.fn().mockResolvedValue({ id: 'place-uuid-1' }),
        },
        payment: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        commission: {
          create: vi.fn().mockResolvedValue({ id: 'comm-1' }),
        },
        outboxJob: {
          create: vi.fn().mockResolvedValue({ id: 'job-1' }),
        },
        auditLog: {
          create: vi.fn().mockResolvedValue({ id: 'log-1' }),
        },
      };

      vi.spyOn(NetworkService, 'findPlacementSlot').mockResolvedValue({
        parentId: 'root-node-uuid',
        slotNumber: 1,
        isSpillover: false,
        sponsorId: 'root-node-uuid',
      });

      return callback(tx);
    });

    const result = await FinalizationService.finalizePaidOrder('order-uuid-success-1');

    expect(result.finalized).toBe(true);
    expect(result.alreadyFinalized).toBe(false);
    expect(result.customer?.id).toBe('user-uuid-1');
    expect(result.network?.id).toBe('net-uuid-1');
  });

  // 2. Failed or pending payment does NOT create NetworkId
  it('2. Failed or pending payment does NOT create NetworkId', async () => {
    const pendingOrder = {
      id: 'order-uuid-pending-2',
      orderNumber: 'TS-2002-PEND',
      status: 'PENDING_PAYMENT',
      paymentStatus: 'INITIATED',
      totalAmountPaise: BigInt(50000),
      currency: 'INR',
      payments: [
        {
          merchantOrderId: 'TXN_TEST_2002',
          amountPaise: BigInt(50000),
          currency: 'INR',
        },
      ],
    };

    vi.spyOn(prisma.order, 'findUnique').mockResolvedValue(pendingOrder as any);
    const txSpy = vi.spyOn(prisma, '$transaction');

    const mockPendingProvider: PaymentProvider = {
      name: 'mock',
      createPayment: vi.fn(),
      getPaymentStatus: vi.fn().mockResolvedValue({
        status: 'PENDING',
        providerReference: 'MOCK-REF-2002',
        amountPaise: 50000,
        currency: 'INR',
        isTestMode: true,
      }),
    };
    ProviderFactory.setCustomPaymentProvider(mockPendingProvider);

    const result = await FinalizationService.finalizePaidOrder('order-uuid-pending-2');

    expect(result.finalized).toBe(false);
    expect(result.status).toBe('PENDING');
    expect(txSpy).not.toHaveBeenCalled();
  });

  // 3. Existing verified phone reuses User
  it('3. Existing verified phone reuses User and does not create duplicate user', async () => {
    const existingUser = {
      id: 'existing-user-uuid-3',
      fullName: 'Priya Sharma',
      phoneE164: '+919876500003',
      status: 'ACTIVE',
    };

    const mockOrder = {
      id: 'order-uuid-reuse-3',
      orderNumber: 'TS-3003-REUSE',
      status: 'PENDING_PAYMENT',
      paymentStatus: 'INITIATED',
      purpose: 'INITIAL_REGISTRATION',
      totalAmountPaise: BigInt(50000),
      currency: 'INR',
      customerName: 'Priya Sharma',
      customerPhone: '+919876500003',
      intendedParentNetworkId: 'root-node-uuid',
      payments: [
        {
          merchantOrderId: 'TXN_TEST_3003',
          amountPaise: BigInt(50000),
          currency: 'INR',
        },
      ],
    };

    vi.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);

    const mockSuccessProvider: PaymentProvider = {
      name: 'mock',
      createPayment: vi.fn(),
      getPaymentStatus: vi.fn().mockResolvedValue({
        status: 'SUCCESS',
        providerReference: 'MOCK-PAY-3003',
        amountPaise: 50000,
        currency: 'INR',
        isTestMode: true,
      }),
    };
    ProviderFactory.setCustomPaymentProvider(mockSuccessProvider);

    let userCreateCalled = false;
    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
      const tx = {
        order: {
          findUniqueOrThrow: vi.fn().mockResolvedValue(mockOrder),
          update: vi.fn().mockResolvedValue({ ...mockOrder, status: 'CONFIRMED' }),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue(existingUser), // User already exists!
          create: vi.fn().mockImplementation(() => {
            userCreateCalled = true;
            return Promise.resolve({});
          }),
        },
        networkId: {
          findFirst: vi.fn().mockResolvedValue(null),
          findUnique: vi.fn().mockResolvedValue({ id: 'root-node-uuid', status: 'ACTIVE', placementDepth: 0 }),
          create: vi.fn().mockResolvedValue({
            id: 'net-3',
            publicId: 'TS-3003',
            referralCode: 'REF3',
            placementDepth: 1,
          }),
        },
        networkPlacement: {
          create: vi.fn().mockResolvedValue({ id: 'pl-3' }),
        },
        payment: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
        commission: { create: vi.fn().mockResolvedValue({}) },
        outboxJob: { create: vi.fn().mockResolvedValue({}) },
        auditLog: { create: vi.fn().mockResolvedValue({}) },
      };

      vi.spyOn(NetworkService, 'findPlacementSlot').mockResolvedValue({
        parentId: 'root-node-uuid',
        slotNumber: 1,
        isSpillover: false,
        sponsorId: 'root-node-uuid',
      });

      return callback(tx);
    });

    const result = await FinalizationService.finalizePaidOrder('order-uuid-reuse-3');

    expect(result.finalized).toBe(true);
    expect(result.customer?.id).toBe('existing-user-uuid-3');
    expect(userCreateCalled).toBe(false);
  });

  // 4. Repeating finalization does not duplicate records (Idempotency)
  it('4. Repeating finalization returns existing result without duplicating records', async () => {
    const alreadyPaidOrder = {
      id: 'order-uuid-paid-4',
      orderNumber: 'TS-4004-IDEM',
      status: 'CONFIRMED',
      paymentStatus: 'SUCCESS',
      userId: 'user-uuid-4',
      networkIdId: 'net-uuid-4',
      payments: [{ merchantOrderId: 'TXN_ALREADY_PAID' }],
    };

    vi.spyOn(prisma.order, 'findUnique').mockResolvedValue(alreadyPaidOrder as any);
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: 'user-uuid-4',
      fullName: 'Rahul Verma',
      phoneE164: '+919876500004',
    } as any);
    vi.spyOn(prisma.networkId, 'findUnique').mockResolvedValue({
      id: 'net-uuid-4',
      publicId: 'TS-4004',
      referralCode: 'REF4004',
      placementDepth: 1,
    } as any);

    const txSpy = vi.spyOn(prisma, '$transaction');

    const result = await FinalizationService.finalizePaidOrder('order-uuid-paid-4');

    expect(result.finalized).toBe(true);
    expect(result.alreadyFinalized).toBe(true);
    expect(result.orderNumber).toBe('TS-4004-IDEM');
    expect(result.customer?.fullName).toBe('Rahul Verma');
    expect(result.network?.publicId).toBe('TS-4004');
    expect(txSpy).not.toHaveBeenCalled();
  });

  // 5. Invalid payment amount or currency is rejected
  it('5. Invalid payment amount or currency is rejected with BadRequestError', async () => {
    const mismatchAmountOrder = {
      id: 'order-uuid-mismatch-5a',
      status: 'PENDING_PAYMENT',
      totalAmountPaise: BigInt(50000),
      currency: 'INR',
      payments: [
        {
          merchantOrderId: 'TXN_TEST_5A',
          amountPaise: BigInt(40000), // Mismatched!
          currency: 'INR',
        },
      ],
    };

    vi.spyOn(prisma.order, 'findUnique').mockResolvedValue(mismatchAmountOrder as any);

    await expect(
      FinalizationService.finalizePaidOrder('order-uuid-mismatch-5a')
    ).rejects.toThrow(BadRequestError);

    const mismatchCurrencyOrder = {
      id: 'order-uuid-mismatch-5b',
      status: 'PENDING_PAYMENT',
      totalAmountPaise: BigInt(50000),
      currency: 'INR',
      payments: [
        {
          merchantOrderId: 'TXN_TEST_5B',
          amountPaise: BigInt(50000),
          currency: 'USD', // Mismatched currency!
        },
      ],
    };

    vi.spyOn(prisma.order, 'findUnique').mockResolvedValue(mismatchCurrencyOrder as any);

    await expect(
      FinalizationService.finalizePaidOrder('order-uuid-mismatch-5b')
    ).rejects.toThrow(BadRequestError);
  });

  // 6. Invalid or inactive placement parent is rejected
  it('6. Invalid or inactive placement parent is rejected', async () => {
    const orderWithInactiveParent = {
      id: 'order-uuid-parent-6',
      orderNumber: 'TS-6006-PARENT',
      status: 'PENDING_PAYMENT',
      paymentStatus: 'INITIATED',
      purpose: 'INITIAL_REGISTRATION',
      totalAmountPaise: BigInt(50000),
      currency: 'INR',
      customerName: 'Kavita Rao',
      customerPhone: '+919876500006',
      intendedParentNetworkId: 'inactive-parent-uuid',
      payments: [
        {
          merchantOrderId: 'TXN_TEST_6006',
          amountPaise: BigInt(50000),
          currency: 'INR',
        },
      ],
    };

    vi.spyOn(prisma.order, 'findUnique').mockResolvedValue(orderWithInactiveParent as any);

    const mockSuccessProvider: PaymentProvider = {
      name: 'mock',
      createPayment: vi.fn(),
      getPaymentStatus: vi.fn().mockResolvedValue({
        status: 'SUCCESS',
        amountPaise: 50000,
        currency: 'INR',
      }),
    };
    ProviderFactory.setCustomPaymentProvider(mockSuccessProvider);

    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
      const tx = {
        order: {
          findUniqueOrThrow: vi.fn().mockResolvedValue(orderWithInactiveParent),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: 'user-6' }),
        },
        networkId: {
          findFirst: vi.fn().mockResolvedValue(null),
          // Parent node is INACTIVE
          findUnique: vi.fn().mockResolvedValue({ id: 'inactive-parent-uuid', status: 'SUSPENDED' }),
        },
      };
      return callback(tx);
    });

    await expect(
      FinalizationService.finalizePaidOrder('order-uuid-parent-6')
    ).rejects.toThrow(/Intended parent network node is inactive or invalid/);
  });

  // 7. Duplicate NetworkId creation is prevented
  it('7. Duplicate NetworkId creation is prevented for INITIAL_REGISTRATION if user already has one', async () => {
    const existingUser = {
      id: 'user-with-network-7',
      fullName: 'Vikram Singh',
      phoneE164: '+919876500007',
    };

    const existingNetworkNode = {
      id: 'existing-net-7',
      publicId: 'TS-EXISTING-07',
      referralCode: 'VIKRAM07',
      placementDepth: 1,
      status: 'ACTIVE',
    };

    const initialRegOrder = {
      id: 'order-uuid-dup-7',
      orderNumber: 'TS-7007-DUP',
      status: 'PENDING_PAYMENT',
      paymentStatus: 'INITIATED',
      purpose: 'INITIAL_REGISTRATION',
      totalAmountPaise: BigInt(50000),
      currency: 'INR',
      customerName: 'Vikram Singh',
      customerPhone: '+919876500007',
      intendedParentNetworkId: 'root-node-uuid',
      payments: [
        {
          merchantOrderId: 'TXN_TEST_7007',
          amountPaise: BigInt(50000),
          currency: 'INR',
        },
      ],
    };

    vi.spyOn(prisma.order, 'findUnique').mockResolvedValue(initialRegOrder as any);

    const mockSuccessProvider: PaymentProvider = {
      name: 'mock',
      createPayment: vi.fn(),
      getPaymentStatus: vi.fn().mockResolvedValue({
        status: 'SUCCESS',
        amountPaise: 50000,
        currency: 'INR',
      }),
    };
    ProviderFactory.setCustomPaymentProvider(mockSuccessProvider);

    let networkCreateCalled = false;
    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
      const tx = {
        order: {
          findUniqueOrThrow: vi.fn().mockResolvedValue(initialRegOrder),
          update: vi.fn().mockResolvedValue({ ...initialRegOrder, status: 'CONFIRMED' }),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue(existingUser),
        },
        networkId: {
          findFirst: vi.fn().mockResolvedValue(existingNetworkNode), // User already owns a node!
          create: vi.fn().mockImplementation(() => {
            networkCreateCalled = true;
            return Promise.resolve({});
          }),
        },
        networkPlacement: {
          create: vi.fn().mockResolvedValue({}),
        },
        payment: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
        outboxJob: { create: vi.fn().mockResolvedValue({}) },
        auditLog: { create: vi.fn().mockResolvedValue({}) },
      };
      return callback(tx);
    });

    const result = await FinalizationService.finalizePaidOrder('order-uuid-dup-7');

    expect(result.finalized).toBe(true);
    expect(result.network?.id).toBe('existing-net-7');
    expect(networkCreateCalled).toBe(false);
  });

  // 8. Placement capacity (max 3 children) is enforced; spillover handles 4th child
  it('8. Placement capacity (max 3 children) is enforced; spillover assigns 4th child to downline', async () => {
    const rootNode = {
      id: 'root-8',
      status: 'ACTIVE',
      placements: [
        { slotNumber: 1, childNetworkId: 'child-8-1' },
        { slotNumber: 2, childNetworkId: 'child-8-2' },
        { slotNumber: 3, childNetworkId: 'child-8-3' },
      ],
    };

    const childNode1 = {
      id: 'child-8-1',
      status: 'ACTIVE',
      placements: [
        // child 1 has slot 1 open!
      ],
    };

    const mockDbClient = {
      networkId: {
        findUnique: vi.fn().mockImplementation(({ where }: { where: { id: string } }) => {
          if (where.id === 'root-8') return Promise.resolve(rootNode);
          if (where.id === 'child-8-1') return Promise.resolve(childNode1);
          return Promise.resolve(null);
        }),
      },
    };

    const placement = await NetworkService.findPlacementSlot('root-8', undefined, mockDbClient);

    expect(placement.isSpillover).toBe(true);
    expect(placement.parentId).toBe('child-8-1');
    expect(placement.slotNumber).toBe(1);
    expect(placement.sponsorId).toBe('root-8');
  });

  // 9. Multi-tenant security: User A cannot view User B's network node
  it("9. Multi-tenant security: User A cannot view User B's network node", async () => {
    const nodeOwnedByUserB = {
      id: 'node-b-uuid',
      publicId: 'TS-USERB-001',
      referralCode: 'USERB001',
      ownerUserId: 'user-b-uuid',
      parentNetworkId: null,
      parentNetwork: null,
      placementDepth: 0,
      status: 'ACTIVE',
      placements: [],
      createdAt: new Date(),
    };

    vi.spyOn(prisma.networkId, 'findFirst').mockResolvedValue(nodeOwnedByUserB as any);

    // User A attempts to view User B's network node details
    await expect(
      NetworkService.getNetworkIdDetails('node-b-uuid', 'user-a-uuid')
    ).rejects.toThrow(ForbiddenError);

    // User A attempts to view User B's direct children
    await expect(
      NetworkService.getDirectChildren('node-b-uuid', 'user-a-uuid')
    ).rejects.toThrow(ForbiddenError);

    // User A attempts to view User B's referral info
    await expect(
      NetworkService.getReferralInfo('node-b-uuid', 'user-a-uuid')
    ).rejects.toThrow(ForbiddenError);
  });

  // 10. Mock simulator and mock providers are rejected in production
  it('10. Mock simulator and mock providers are rejected in production mode', async () => {
    // 10a. Env validation rejection
    expect(() => {
      validateEnvironment({
        NODE_ENV: 'production',
        OTP_PROVIDER: 'mock',
        PAYMENT_PROVIDER: 'mock',
      });
    }).toThrow(/is strictly prohibited in production mode/);

    // 10b. Mock Simulator API rejects in production mode
    const fakeRequest = new NextRequest('http://localhost:3000/api/v1/dev/payments/pay-123/simulate', {
      method: 'POST',
      body: JSON.stringify({ status: 'SUCCESS' }),
    });

    // Temporarily simulate production environment
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      const response = await simulatePaymentRoute(fakeRequest, {
        params: Promise.resolve({ paymentId: 'pay-123' }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.code).toBe('FORBIDDEN');
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  // 11. Transient finalization error can be retried without duplicate records
  it('11. Transient finalization error can be retried without duplicate records', async () => {
    const transientOrder = {
      id: 'order-uuid-transient-11',
      orderNumber: 'TS-1100-TRANS',
      status: 'PENDING_PAYMENT',
      paymentStatus: 'INITIATED',
      purpose: 'INITIAL_REGISTRATION',
      totalAmountPaise: BigInt(50000),
      currency: 'INR',
      customerName: 'Ananya Roy',
      customerPhone: '+919876500011',
      intendedParentNetworkId: 'root-node-uuid',
      payments: [
        {
          merchantOrderId: 'TXN_TEST_1100',
          amountPaise: BigInt(50000),
          currency: 'INR',
        },
      ],
    };

    vi.spyOn(prisma.order, 'findUnique').mockResolvedValue(transientOrder as any);

    const mockSuccessProvider: PaymentProvider = {
      name: 'mock',
      createPayment: vi.fn(),
      getPaymentStatus: vi.fn().mockResolvedValue({
        status: 'SUCCESS',
        amountPaise: 50000,
        currency: 'INR',
      }),
    };
    ProviderFactory.setCustomPaymentProvider(mockSuccessProvider);

    let attempt = 0;
    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
      attempt++;
      if (attempt === 1) {
        throw new Error('Connection terminated unexpectedly');
      }

      const tx = {
        order: {
          findUniqueOrThrow: vi.fn().mockResolvedValue(transientOrder),
          update: vi.fn().mockResolvedValue({ ...transientOrder, status: 'CONFIRMED' }),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: 'user-11' }),
        },
        networkId: {
          findFirst: vi.fn().mockResolvedValue(null),
          findUnique: vi.fn().mockResolvedValue({ id: 'root-node-uuid', status: 'ACTIVE', placementDepth: 0 }),
          create: vi.fn().mockResolvedValue({ id: 'net-11', publicId: 'TS-11', referralCode: 'ANANYA11' }),
        },
        networkPlacement: {
          create: vi.fn().mockResolvedValue({}),
        },
        payment: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
        commission: { create: vi.fn().mockResolvedValue({}) },
        outboxJob: { create: vi.fn().mockResolvedValue({}) },
        auditLog: { create: vi.fn().mockResolvedValue({}) },
      };

      vi.spyOn(NetworkService, 'findPlacementSlot').mockResolvedValue({
        parentId: 'root-node-uuid',
        slotNumber: 1,
        isSpillover: false,
        sponsorId: 'root-node-uuid',
      });

      return callback(tx);
    });

    // Attempt 1: Fails due to transient error
    await expect(
      FinalizationService.finalizePaidOrder('order-uuid-transient-11')
    ).rejects.toThrow('Connection terminated unexpectedly');

    // Attempt 2: Retry succeeds cleanly
    const retryResult = await FinalizationService.finalizePaidOrder('order-uuid-transient-11');
    expect(retryResult.finalized).toBe(true);
    expect(retryResult.customer?.id).toBe('user-11');
    expect(retryResult.network?.id).toBe('net-11');
  });

  // 12. Finalization links referenced Address row to newly created User account
  it('12. Finalization links referenced Address row to User account', async () => {
    const mockOrder = {
      id: 'order-uuid-address-12',
      orderNumber: 'TS-1200-ADDR',
      status: 'PENDING_PAYMENT',
      paymentStatus: 'INITIATED',
      purpose: 'INITIAL_REGISTRATION',
      totalAmountPaise: BigInt(50000),
      currency: 'INR',
      customerName: 'Priya Verma',
      customerPhone: '+919876543212',
      customerEmail: 'priya@example.com',
      shippingAddressId: 'addr-uuid-12',
      intendedParentNetworkId: 'root-node-uuid',
      payments: [
        {
          id: 'pay-uuid-12',
          merchantOrderId: 'TXN_TEST_1200',
          amountPaise: BigInt(50000),
          currency: 'INR',
          status: 'INITIATED',
        },
      ],
      checkoutSession: null,
    };

    const mockUnlinkedAddress = {
      id: 'addr-uuid-12',
      userId: null, // initially null for guest checkout
      fullName: 'Priya Verma',
      phone: '+919876543212',
      addressLine1: 'Flat 402, Lotus Residency',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411001',
      isDefault: false,
    };

    const addressUpdateSpy = vi.fn().mockResolvedValue({
      ...mockUnlinkedAddress,
      userId: 'user-uuid-12',
      isDefault: true,
    });

    vi.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);

    const mockSuccessProvider: PaymentProvider = {
      name: 'mock',
      createPayment: vi.fn(),
      getPaymentStatus: vi.fn().mockResolvedValue({
        status: 'SUCCESS',
        providerReference: 'MOCK-PAY-1200',
        amountPaise: 50000,
        currency: 'INR',
        isTestMode: true,
      }),
    };
    ProviderFactory.setCustomPaymentProvider(mockSuccessProvider);

    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
      const tx = {
        order: {
          findUniqueOrThrow: vi.fn().mockResolvedValue(mockOrder),
          update: vi.fn().mockResolvedValue({
            ...mockOrder,
            status: 'CONFIRMED',
            paymentStatus: 'SUCCESS',
            userId: 'user-uuid-12',
            networkIdId: 'net-uuid-12',
          }),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
            id: 'user-uuid-12',
            fullName: 'Priya Verma',
            phoneE164: '+919876543212',
          }),
        },
        address: {
          findUnique: vi.fn().mockResolvedValue(mockUnlinkedAddress),
          findFirst: vi.fn().mockResolvedValue(null), // no existing default address
          update: addressUpdateSpy,
        },
        networkId: {
          findFirst: vi.fn().mockResolvedValue(null),
          findUnique: vi.fn().mockResolvedValue({ id: 'root-node-uuid', status: 'ACTIVE', placementDepth: 0 }),
          create: vi.fn().mockResolvedValue({ id: 'net-uuid-12', publicId: 'TS-12', referralCode: 'PRIYA12' }),
        },
        networkPlacement: {
          create: vi.fn().mockResolvedValue({}),
        },
        payment: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
        commission: { create: vi.fn().mockResolvedValue({}) },
        outboxJob: { create: vi.fn().mockResolvedValue({}) },
        auditLog: { create: vi.fn().mockResolvedValue({}) },
      };

      vi.spyOn(NetworkService, 'findPlacementSlot').mockResolvedValue({
        parentId: 'root-node-uuid',
        slotNumber: 1,
        isSpillover: false,
        sponsorId: 'root-node-uuid',
      });

      return callback(tx);
    });

    const result = await FinalizationService.finalizePaidOrder('order-uuid-address-12');
    expect(result.finalized).toBe(true);
    expect(result.customer?.id).toBe('user-uuid-12');

    // Verify Address update was called linking user_id and setting isDefault: true
    expect(addressUpdateSpy).toHaveBeenCalledWith({
      where: { id: 'addr-uuid-12' },
      data: {
        userId: 'user-uuid-12',
        isDefault: true,
      },
    });
  });
});
