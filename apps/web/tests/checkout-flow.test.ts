import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CheckoutService } from '../src/modules/checkout/checkout.service';
import { prisma } from '../src/lib/db';
import { ProviderFactory } from '../src/modules/providers/provider.factory';
import { resetEnvForTesting } from '../src/lib/env';

describe('Checkout Flow Domain Logic', () => {
  beforeEach(() => {
    resetEnvForTesting();
    ProviderFactory.reset();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    ProviderFactory.reset();
    vi.restoreAllMocks();
  });

  it('enforces server-authoritative pricing (₹500 = 50,000 paise per unit)', async () => {
    const mockProduct = {
      id: 'prod-uuid-1',
      name: 'Tulsi Meta Ved — Herbal Mix',
      slug: 'tulsi-meta-ved-herbal-mix',
      sku: 'META-VED-001',
      pricePaise: BigInt(50000),
      currency: 'INR',
      isActive: true,
      status: 'PUBLISHED',
    };

    const mockSession = {
      id: 'sess-uuid-1',
      productId: mockProduct.id,
      quantity: 2,
      unitPricePaise: BigInt(50000),
      totalAmountPaise: BigInt(100000), // 2 * 50,000 = 100,000 paise
      purpose: 'INITIAL_REGISTRATION',
      status: 'INITIATED',
      expiresAt: new Date(Date.now() + 3600000),
      product: mockProduct,
    };

    (prisma as any).product = {
      findUnique: vi.fn().mockResolvedValue(mockProduct),
      findFirst: vi.fn().mockResolvedValue(mockProduct),
    };

    (prisma as any).checkoutSession = {
      create: vi.fn().mockResolvedValue(mockSession),
    };

    const session = await CheckoutService.createSession({
      productSlug: 'tulsi-meta-ved-herbal-mix',
      quantity: 2,
    });

    expect(Number(session.unitPricePaise)).toBe(50000);
    expect(Number(session.totalAmountPaise)).toBe(100000);
    expect(session.status).toBe('INITIATED');
  });

  it('validates customer phone format and normalizes to E.164 (+91)', async () => {
    const mockSession = {
      id: 'sess-uuid-1',
      customerName: null,
      customerPhone: null,
      status: 'INITIATED',
      phoneVerifiedAt: null,
    };

    vi.spyOn(CheckoutService, 'getSession').mockResolvedValue(mockSession as any);

    const updateMock = vi.fn().mockImplementation(async (args) => {
      return { ...mockSession, ...args.data };
    });

    (prisma as any).checkoutSession = {
      update: updateMock,
    };

    await CheckoutService.updateCustomerDetails('sess-uuid-1', {
      fullName: 'Anita Devi',
      phone: '9812345678',
      shippingAddress: {
        fullName: 'Anita Devi',
        phone: '9812345678',
        addressLine1: 'House 12, Main Bazar',
        city: 'Jaipur',
        state: 'Rajasthan',
        postalCode: '302001',
      },
    });

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          customerPhone: '+919812345678',
          customerName: 'Anita Devi',
        }),
      })
    );
  });

  it('rejects foreign phone numbers and invalid Indian mobile numbers', async () => {
    const mockSession = {
      id: 'sess-uuid-foreign',
      status: 'INITIATED',
      orderId: null,
      phoneVerifiedAt: null,
      expiresAt: new Date(Date.now() + 3600000),
    };
    vi.spyOn(CheckoutService, 'getSession').mockResolvedValue(mockSession as any);

    // Foreign US number: +1 415 555 2671
    await expect(
      CheckoutService.updateCustomerDetails('sess-uuid-foreign', {
        fullName: 'John Doe',
        phone: '+14155552671',
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+14155552671',
          addressLine1: '123 Market Street',
          city: 'San Francisco',
          state: 'California',
          postalCode: '94105',
        },
      })
    ).rejects.toThrow(/Only Indian phone numbers \(\+91\) are accepted/);

    // Invalid prefix: starts with 5 (not 6, 7, 8, or 9)
    await expect(
      CheckoutService.updateCustomerDetails('sess-uuid-foreign', {
        fullName: 'John Doe',
        phone: '5812345678',
        shippingAddress: {
          fullName: 'John Doe',
          phone: '5812345678',
          addressLine1: '123 Market Street',
          city: 'Jaipur',
          state: 'Rajasthan',
          postalCode: '302001',
        },
      })
    ).rejects.toThrow(/Indian mobile numbers must start with digits 6, 7, 8, or 9/);

    // Invalid PIN code: 5 digits instead of 6
    await expect(
      CheckoutService.updateCustomerDetails('sess-uuid-foreign', {
        fullName: 'Anita Devi',
        phone: '9812345678',
        shippingAddress: {
          fullName: 'Anita Devi',
          phone: '9812345678',
          addressLine1: '123 Market Street',
          city: 'Jaipur',
          state: 'Rajasthan',
          postalCode: '30200', // invalid PIN
        },
      })
    ).rejects.toThrow(/Please enter a valid 6-digit Indian PIN code/);
  });

  it('rejects checkout confirmation if phone is not yet verified', async () => {
    const unverifiedSession = {
      id: 'sess-uuid-unverified',
      orderId: null,
      phoneVerifiedAt: null, // NOT verified
      customerName: 'Rohan Sharma',
      customerPhone: '+919876543210',
      shippingAddress: { addressLine1: 'Sample Street' },
      expiresAt: new Date(Date.now() + 3600000),
    };

    vi.spyOn(CheckoutService, 'getSession').mockResolvedValue(unverifiedSession as any);

    await expect(
      CheckoutService.confirmCheckout('sess-uuid-unverified')
    ).rejects.toThrow(/Phone number must be verified via OTP before confirming order/);
  });
});
