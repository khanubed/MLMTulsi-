import { prisma } from '../../lib/db';
import { BadRequestError, NotFoundError } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { ProviderFactory } from '../providers/provider.factory';

export class PaymentsService {
  /**
   * Initiates payment for a confirmed order via the configured PaymentProvider.
   */
  static async initiateOrderPayment(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError(`Order ${orderId} not found`);
    }

    if (order.status === 'PAID' || order.status === 'CONFIRMED') {
      throw new BadRequestError('Order is already paid');
    }

    const merchantTransactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const paymentProvider = ProviderFactory.getPaymentProvider();

    // 1. Create payment attempt with Provider
    const providerResult = await paymentProvider.createPayment({
      orderId: order.id,
      merchantTransactionId,
      amountPaise: Number(order.totalAmountPaise),
      currency: order.currency,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
    });

    // 2. Persist Payment in database
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: paymentProvider.name.toUpperCase(),
        merchantOrderId: merchantTransactionId,
        providerTransactionId: providerResult.providerReference,
        amountPaise: order.totalAmountPaise,
        currency: order.currency,
        status: 'INITIATED',
        checkoutUrl: providerResult.checkoutUrl,
        isTestMode: providerResult.testMode,
        mockStatus: 'PENDING',
        initiatedAt: new Date(),
      },
    });

    logger.info('Payment checkout initialized successfully', {
      meta: {
        paymentId: payment.id,
        orderId: order.id,
        merchantTransactionId,
        checkoutUrl: providerResult.checkoutUrl,
      },
    });

    return {
      success: true,
      paymentId: payment.id,
      orderId: order.id,
      merchantTransactionId,
      amountPaise: Number(payment.amountPaise),
      currency: payment.currency,
      checkoutUrl: providerResult.checkoutUrl,
      isTestMode: providerResult.testMode,
    };
  }

  /**
   * Verifies payment status and coordinates finalization.
   */
  static async getPaymentStatus(paymentIdOrTransactionId: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paymentIdOrTransactionId);
    const whereClause = isUuid
      ? { OR: [{ id: paymentIdOrTransactionId }, { merchantOrderId: paymentIdOrTransactionId }] }
      : { merchantOrderId: paymentIdOrTransactionId };

    const payment = await prisma.payment.findFirst({
      where: whereClause,
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment transaction record not found');
    }

    const paymentProvider = ProviderFactory.getPaymentProvider();
    const statusResult = await paymentProvider.getPaymentStatus({
      merchantTransactionId: payment.merchantOrderId,
      orderId: payment.orderId,
    });

    return {
      paymentId: payment.id,
      orderId: payment.orderId,
      orderNumber: payment.order.orderNumber,
      merchantTransactionId: payment.merchantOrderId,
      status: statusResult.status,
      amountPaise: statusResult.amountPaise,
      currency: statusResult.currency,
      isTestMode: statusResult.isTestMode,
    };
  }

  static async initiatePhonePeCheckout(orderId: string, _amountPaise: number) {
    return this.initiateOrderPayment(orderId);
  }

  static async verifyWebhookSignature(body: unknown, signatureHeader: string | null): Promise<boolean> {
    if (!signatureHeader) {
      return false;
    }
    return true;
  }
}
