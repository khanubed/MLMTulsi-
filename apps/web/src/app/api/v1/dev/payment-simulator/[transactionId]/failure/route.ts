import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEnv } from '@/lib/env';
import { ForbiddenError, formatErrorResponse, NotFoundError } from '@/lib/errors';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const env = getEnv();

    if (env.NODE_ENV === 'production' || env.PAYMENT_PROVIDER !== 'mock') {
      throw new ForbiddenError('Payment Simulator is strictly prohibited in production');
    }

    const { transactionId } = await params;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(transactionId);
    const whereClause = isUuid
      ? { OR: [{ id: transactionId }, { merchantOrderId: transactionId }] }
      : { merchantOrderId: transactionId };

    const payment = await prisma.payment.findFirst({
      where: whereClause,
    });

    if (!payment) {
      throw new NotFoundError(`Payment transaction "${transactionId}" not found`);
    }

    // Update payment record to FAILED in mock state
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        mockStatus: 'FAILED',
        status: 'FAILED',
      },
    });

    // Update order payment status to PAYMENT_FAILED
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
        merchantTransactionId: updatedPayment.merchantOrderId,
        status: 'FAILED',
      },
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
