import { prisma } from '../../../lib/db';
import { getEnv } from '../../../lib/env';
import { logger } from '../../../lib/logger';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
  PaymentProvider,
  PaymentProviderStatus,
  PaymentStatusInput,
  PaymentStatusOutput,
} from '../interfaces/payment-provider.interface';

export class MockPaymentProvider implements PaymentProvider {
  public readonly name = 'mock';

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const env = getEnv();

    if (env.NODE_ENV === 'production') {
      throw new Error(
        'SECURITY EXCEPTION: MockPaymentProvider invocation attempted in production environment. Aborting.'
      );
    }

    const providerReference = `MOCK-PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const checkoutUrl = `/dev/payment-simulator/${encodeURIComponent(input.merchantTransactionId)}`;

    logger.info('💳 [MOCK PAYMENT PROVIDER] Payment Attempt Initialized', {
      meta: {
        orderId: input.orderId,
        merchantTransactionId: input.merchantTransactionId,
        amountPaise: input.amountPaise,
        checkoutUrl,
        providerReference,
      },
    });

    return {
      providerReference,
      checkoutUrl,
      status: 'PENDING',
      testMode: true,
    };
  }

  async getPaymentStatus(input: PaymentStatusInput): Promise<PaymentStatusOutput> {
    const env = getEnv();

    if (env.NODE_ENV === 'production') {
      throw new Error(
        'SECURITY EXCEPTION: MockPaymentProvider invocation attempted in production environment. Aborting.'
      );
    }

    // Query database for authoritative payment record
    const payment = await prisma.payment.findFirst({
      where: {
        merchantOrderId: input.merchantTransactionId,
      },
    });

    if (!payment) {
      throw new Error(
        `Mock payment record not found for transaction: ${input.merchantTransactionId}`
      );
    }

    // Map internal mockStatus or status to provider status
    let status: PaymentProviderStatus = 'PENDING';
    const currentMock = payment.mockStatus?.toUpperCase();

    if (currentMock === 'SUCCESS' || payment.status === 'SUCCESS') {
      status = 'SUCCESS';
    } else if (currentMock === 'FAILED' || payment.status === 'FAILED') {
      status = 'FAILED';
    }

    return {
      status,
      providerReference: payment.providerTransactionId || `MOCK-${payment.id.slice(0, 8)}`,
      amountPaise: Number(payment.amountPaise),
      currency: payment.currency,
      isTestMode: true,
      rawResponse: {
        mockStatus: payment.mockStatus,
        internalStatus: payment.status,
        provider: payment.provider,
        verifiedAt: payment.verifiedAt,
      },
    };
  }
}
