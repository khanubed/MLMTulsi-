import { NextRequest, NextResponse } from 'next/server';
import { formatErrorResponse } from '@/lib/errors';
import { AuthService } from '@/modules/auth/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, phone, otp } = body;

    if (action === 'send-otp') {
      const res = await AuthService.sendOtp(phone);
      return NextResponse.json(res);
    }

    if (action === 'verify-otp') {
      const res = await AuthService.verifyOtp(phone, otp);
      return NextResponse.json(res);
    }

    return NextResponse.json({ success: true, message: 'Auth API v1 operational' });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'auth',
    version: 'v1',
    status: 'HEALTHY',
    endpoints: ['/api/v1/auth/send-otp', '/api/v1/auth/verify-otp', '/api/v1/auth/me'],
  });
}
