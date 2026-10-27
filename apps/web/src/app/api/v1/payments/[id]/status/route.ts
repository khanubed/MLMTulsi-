import { NextRequest, NextResponse } from 'next/server';
import { formatErrorResponse } from '@/lib/errors';
import { FinalizationService } from '@/modules/checkout/finalization.service';
import { PaymentsService } from '@/modules/payments/payments.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const paymentStatus = await PaymentsService.getPaymentStatus(id);

    let finalizationResult = null;

    // If payment is authoritatively SUCCESS, invoke finalization workflow
    if (paymentStatus.status === 'SUCCESS') {
      finalizationResult = await FinalizationService.finalizePaidRegistration(
        paymentStatus.orderId
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        payment: paymentStatus,
        finalization: finalizationResult,
      },
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
