import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEnv } from '@/lib/env';
import { ForbiddenError, formatErrorResponse, NotFoundError } from '@/lib/errors';
import { FinalizationService } from '@/modules/checkout/finalization.service';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const env = getEnv();

    if (env.NODE_ENV === 'production' || env.PAYMENT_PROVIDER !== 'mock') {
      throw new ForbiddenError('Payment Simulator is strictly prohibited in production');
    }

    if (!env.MOCK_PAYMENT_ALLOW_SUCCESS) {
      throw new ForbiddenError('Mock payment success simulation is disabled by configuration');
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

    // Update payment record to SUCCESS in mock provider state
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        mockStatus: 'SUCCESS',
        status: 'SUCCESS',
        verifiedAt: new Date(),
      },
    });

    // Authoritatively run standard finalization service
    const finalizationResult = await FinalizationService.finalizePaidRegistration(
      payment.orderId
    );

    return NextResponse.json({
      success: true,
      message: 'Simulated payment SUCCESS registered and finalization executed',
      data: {
        merchantTransactionId: updatedPayment.merchantOrderId,
        status: 'SUCCESS',
        finalization: finalizationResult,
      },
    });
  } catch (error) {
    console.error('❌ [Payment Simulator Success Error]:', error);
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
