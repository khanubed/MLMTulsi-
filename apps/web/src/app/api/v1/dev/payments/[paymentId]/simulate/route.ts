import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEnv } from '@/lib/env';
import { BadRequestError, ForbiddenError, formatErrorResponse, NotFoundError } from '@/lib/errors';
import { FinalizationService } from '@/modules/checkout/finalization.service';

/**
 * Development-Only Mock Payment Simulator API
 * POST /api/v1/dev/payments/:paymentId/simulate
 * Body: { "status": "SUCCESS" | "FAILED" | "PENDING" }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    // Strict Production Safeguard
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenError('Payment Simulator is strictly prohibited in production');
    }

    const env = getEnv();
    if (env.PAYMENT_PROVIDER !== 'mock') {
      throw new ForbiddenError('Payment Simulator is only available when PAYMENT_PROVIDER=mock');
    }

    const { paymentId } = await params;
    const body = await request.json().catch(() => ({}));
    const targetStatus = (body.status || 'SUCCESS').toUpperCase();

    if (!['SUCCESS', 'FAILED', 'PENDING'].includes(targetStatus)) {
      throw new BadRequestError('Invalid simulation status. Allowed values: SUCCESS, FAILED, PENDING');
    }

    if (targetStatus === 'SUCCESS' && !env.MOCK_PAYMENT_ALLOW_SUCCESS) {
      throw new ForbiddenError('Mock payment success simulation is disabled by configuration');
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paymentId);
    const whereClause = isUuid
      ? { OR: [{ id: paymentId }, { merchantOrderId: paymentId }] }
      : { merchantOrderId: paymentId };

    const payment = await prisma.payment.findFirst({
      where: whereClause,
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundError(`Payment transaction "${paymentId}" not found`);
    }

    if (targetStatus === 'SUCCESS') {
      // 1. Update Payment record to SUCCESS
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          mockStatus: 'SUCCESS',
          status: 'SUCCESS',
          verifiedAt: new Date(),
        },
      });

      // 2. Authoritatively invoke finalization service
      const finalization = await FinalizationService.finalizePaidOrder(
        payment.orderId,
        updatedPayment.merchantOrderId
      );

      return NextResponse.json({
        success: true,
        message: 'Simulated payment SUCCESS registered and finalization executed',
        data: {
          paymentId: updatedPayment.id,
          merchantTransactionId: updatedPayment.merchantOrderId,
          status: 'SUCCESS',
          amountPaise: Number(updatedPayment.amountPaise),
          orderId: payment.orderId,
          finalization,
        },
      });
    }

    if (targetStatus === 'FAILED') {
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          mockStatus: 'FAILED',
          status: 'FAILED',
        },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'FAILED',
          status: 'PAYMENT_FAILED',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Simulated payment FAILED recorded',
        data: {
          paymentId: updatedPayment.id,
          merchantTransactionId: updatedPayment.merchantOrderId,
          status: 'FAILED',
          amountPaise: Number(updatedPayment.amountPaise),
          orderId: payment.orderId,
        },
      });
    }

    // PENDING state
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        mockStatus: 'PENDING',
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Simulated payment state set to PENDING',
      data: {
        paymentId: updatedPayment.id,
        merchantTransactionId: updatedPayment.merchantOrderId,
        status: 'PENDING',
        amountPaise: Number(updatedPayment.amountPaise),
        orderId: payment.orderId,
      },
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
