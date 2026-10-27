import { NextRequest, NextResponse } from 'next/server';
import { formatErrorResponse } from '@/lib/errors';
import { NetworkService } from '@/modules/network/network.service';

export async function GET() {
  try {
    const list = await NetworkService.listUserNetworkIds('demo-user');
    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode } = body;
    const validation = await NetworkService.validateReferralCode(referralCode);
    return NextResponse.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
