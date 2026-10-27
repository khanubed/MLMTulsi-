import { NextRequest, NextResponse } from 'next/server';
import { formatErrorResponse } from '@/lib/errors';
import { CheckoutService } from '@/modules/checkout/checkout.service';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await CheckoutService.requestPhoneOtp(id);

    return NextResponse.json({
      success: true,
      data: {
        challengeId: result.challengeId,
        phone: result.phone,
        expiresInSeconds: result.expiresInSeconds,
        developmentOtp: result.developmentOtp,
      },
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
