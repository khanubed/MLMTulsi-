import { NextRequest, NextResponse } from 'next/server';
import { formatErrorResponse } from '@/lib/errors';
import { CheckoutService } from '@/modules/checkout/checkout.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const session = await CheckoutService.createSession(body);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: session.id,
          productId: session.productId,
          quantity: session.quantity,
          unitPricePaise: Number(session.unitPricePaise),
          totalAmountPaise: Number(session.totalAmountPaise),
          status: session.status,
          purpose: session.purpose,
          expiresAt: session.expiresAt,
          product: session.product
            ? {
                name: session.product.name,
                slug: session.product.slug,
                sku: session.product.sku,
              }
            : null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
