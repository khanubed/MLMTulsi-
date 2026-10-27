import { NextRequest, NextResponse } from 'next/server';
import { formatErrorResponse } from '@/lib/errors';
import { OrdersService } from '@/modules/orders/orders.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order = await OrdersService.createOrder('user-demo', body);
    return NextResponse.json({
      success: true,
      data: order,
    }, { status: 201 });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [],
  });
}
