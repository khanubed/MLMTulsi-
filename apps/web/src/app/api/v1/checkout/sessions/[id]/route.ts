import { NextRequest, NextResponse } from 'next/server';
import { formatErrorResponse } from '@/lib/errors';
import { CheckoutService } from '@/modules/checkout/checkout.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await CheckoutService.getSession(id);

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        productId: session.productId,
        quantity: session.quantity,
        unitPricePaise: Number(session.unitPricePaise),
        totalAmountPaise: Number(session.totalAmountPaise),
        status: session.status,
        purpose: session.purpose,
        customerName: session.customerName,
        customerPhone: session.customerPhone,
        customerEmail: session.customerEmail,
        shippingAddress: session.shippingAddress,
        referralCode: session.referralCode,
        intendedParentId: session.intendedParentId,
        intendedSlot: session.intendedSlot,
        phoneVerifiedAt: session.phoneVerifiedAt,
        orderId: session.orderId,
        expiresAt: session.expiresAt,
        order: session.order,
        product: session.product,
      },
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
