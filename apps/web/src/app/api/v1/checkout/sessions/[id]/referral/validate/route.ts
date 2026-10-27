import { NextRequest, NextResponse } from 'next/server';
import { BadRequestError, formatErrorResponse } from '@/lib/errors';
import { CheckoutService } from '@/modules/checkout/checkout.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.referralCode) {
      throw new BadRequestError('referralCode is required');
    }

    const result = await CheckoutService.validateReferral(
      id,
      body.referralCode,
      body.preferredSlot
    );

    return NextResponse.json({
      success: true,
      data: {
        sessionId: result.session.id,
        referralCode: result.session.referralCode,
        sponsor: result.sponsor,
        placement: result.placement,
      },
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
