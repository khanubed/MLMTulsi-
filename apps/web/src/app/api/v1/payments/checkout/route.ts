import { NextRequest, NextResponse } from 'next/server';
import { BadRequestError, formatErrorResponse } from '@/lib/errors';
import { PaymentsService } from '@/modules/payments/payments.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.orderId) {
      throw new BadRequestError('orderId is required');
    }

    const result = await PaymentsService.initiateOrderPayment(body.orderId);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
