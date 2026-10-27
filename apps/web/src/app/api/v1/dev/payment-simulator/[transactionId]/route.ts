import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEnv } from '@/lib/env';
import { ForbiddenError, formatErrorResponse, NotFoundError } from '@/lib/errors';

export async function GET(
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
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            customerPhone: true,
            totalAmountPaise: true,
            currency: true,
            status: true,
            purpose: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundError(`Payment transaction "${transactionId}" not found`);
    }

    return NextResponse.json({
      success: true,
      data: {
        merchantTransactionId: payment.merchantOrderId,
        providerReference: payment.providerTransactionId,
        amountPaise: Number(payment.amountPaise),
        amountRupees: Number(payment.amountPaise) / 100,
        currency: payment.currency,
        status: payment.status,
        mockStatus: payment.mockStatus || 'PENDING',
        order: payment.order
          ? {
              ...payment.order,
              totalAmountPaise: Number(payment.order.totalAmountPaise),
            }
          : null,
      },
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
