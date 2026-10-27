import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockPaymentProvider } from '../src/modules/providers/mock/mock-payment.provider';
import { resetEnvForTesting } from '../src/lib/env';

describe('Mock Payment Provider Architecture', () => {
  beforeEach(() => {
    resetEnvForTesting();
    process.env.NODE_ENV = 'development';
    process.env.PAYMENT_PROVIDER = 'mock';
  });

  afterEach(() => {
    resetEnvForTesting();
  });

  it('creates mock payment attempt with local simulator checkoutUrl', async () => {
    const provider = new MockPaymentProvider();
    const result = await provider.createPayment({
      orderId: 'test-order-123',
      merchantTransactionId: 'TXN_TEST_999',
      amountPaise: 50000,
      currency: 'INR',
    });

    expect(result.status).toBe('PENDING');
    expect(result.testMode).toBe(true);
    expect(result.providerReference).toContain('MOCK-PAY-');
    expect(result.checkoutUrl).toBe('/dev/payment-simulator/TXN_TEST_999');
  });

  it('rejects mock payment creation in production environment', async () => {
    process.env.NODE_ENV = 'production';
    resetEnvForTesting();

    const provider = new MockPaymentProvider();
    await expect(
      provider.createPayment({
        orderId: 'test-order-123',
        merchantTransactionId: 'TXN_TEST_999',
        amountPaise: 50000,
        currency: 'INR',
      })
    ).rejects.toThrow(/strictly prohibited in production mode|production environment/);
  });
});
