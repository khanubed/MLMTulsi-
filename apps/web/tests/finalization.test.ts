import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FinalizationService } from '../src/modules/checkout/finalization.service';
import { prisma } from '../src/lib/db';
import { ProviderFactory } from '../src/modules/providers/provider.factory';
import { PaymentProvider } from '../src/modules/providers/interfaces/payment-provider.interface';

describe('Payment Finalization & Registration Integrity', () => {
  beforeEach(() => {
    ProviderFactory.reset();
  });

  afterEach(() => {
    ProviderFactory.reset();
    vi.restoreAllMocks();
  });

  it('returns early and safely if order is already finalized (idempotent)', async () => {
    const paidOrder = {
      id: 'order-uuid-already-paid',
      orderNumber: 'TS-998877-ABCD',
      status: 'CONFIRMED',
      paymentStatus: 'SUCCESS',
      payments: [{ merchantOrderId: 'TXN_ALREADY_PAID' }],
    };

    vi.spyOn(prisma.order, 'findUnique').mockResolvedValue(paidOrder as any);

    const result = await FinalizationService.finalizePaidRegistration('order-uuid-already-paid');
    expect(result.alreadyFinalized).toBe(true);
    expect(result.orderNumber).toBe('TS-998877-ABCD');
  });

  it('aborts finalization if payment status from provider is not SUCCESS', async () => {
    const pendingOrder = {
      id: 'order-uuid-pending',
      orderNumber: 'TS-112233-EFGH',
      status: 'PENDING_PAYMENT',
      paymentStatus: 'INITIATED',
      payments: [{ merchantOrderId: 'TXN_STILL_PENDING' }],
    };

    vi.spyOn(prisma.order, 'findUnique').mockResolvedValue(pendingOrder as any);

    // Mock custom provider returning PENDING
    const mockPendingProvider: PaymentProvider = {
      name: 'test_provider',
      createPayment: vi.fn(),
      getPaymentStatus: vi.fn().mockResolvedValue({
        status: 'PENDING',
        providerReference: 'TEST-REF',
        amountPaise: 50000,
        currency: 'INR',
        isTestMode: true,
      }),
    };

    ProviderFactory.setCustomPaymentProvider(mockPendingProvider);

    const result = await FinalizationService.finalizePaidRegistration('order-uuid-pending');
    expect(result.finalized).toBe(false);
    expect(result.status).toBe('PENDING');
  });
});
