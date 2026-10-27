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

    if (!body.challengeId || !body.code) {
      throw new BadRequestError('challengeId and code are required');
    }

    const result = await CheckoutService.verifyPhoneOtp(id, body.challengeId, body.code);

    return NextResponse.json({
      success: true,
      data: {
        verified: result.verified,
        phone: result.phone,
        verifiedAt: result.verifiedAt,
        isExistingUser: result.isExistingUser,
      },
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
