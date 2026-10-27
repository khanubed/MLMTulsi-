import { NextRequest, NextResponse } from 'next/server';
import { formatErrorResponse } from '@/lib/errors';
import { PaymentsService } from '@/modules/payments/payments.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amountPaise } = body;
    const checkout = await PaymentsService.initiatePhonePeCheckout(orderId, amountPaise || 50000);
    return NextResponse.json({
      success: true,
      data: checkout,
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
