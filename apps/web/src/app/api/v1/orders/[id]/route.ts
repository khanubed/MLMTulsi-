import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { formatErrorResponse, NotFoundError } from '@/lib/errors';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        shippingAddress: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!order) {
      throw new NotFoundError(`Order "${id}" not found`);
    }

    const productName = order.productNameSnapshot || 'Tulsi Meta Ved — Herbal Mix';
    const unitPricePaise = Number(order.unitPricePaise);
    const totalAmountPaise = Number(order.totalAmountPaise);

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        productId: order.productId,
        productName,
        productSlug: order.productSlugSnapshot || 'tulsi-meta-ved',
        sku: order.skuSnapshot,
        quantity: order.quantity,
        unitPricePaise,
        status: order.status,
        paymentStatus: order.paymentStatus,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        shippingAddressId: order.shippingAddressId,
        shippingAddress: order.shippingAddress
          ? {
              id: order.shippingAddress.id,
              fullName: order.shippingAddress.fullName,
              phone: order.shippingAddress.phone,
              addressLine1: order.shippingAddress.addressLine1,
              addressLine2: order.shippingAddress.addressLine2,
              landmark: order.shippingAddress.landmark,
              city: order.shippingAddress.city,
              state: order.shippingAddress.state,
              postalCode: order.shippingAddress.postalCode,
              country: order.shippingAddress.country,
              houseFlat: order.shippingAddress.addressLine1,
              streetLocality: order.shippingAddress.addressLine2 || '',
              pinCode: order.shippingAddress.postalCode,
              mobile: order.shippingAddress.phone,
            }
          : null,
        totalAmountPaise,
        totalAmountRupees: totalAmountPaise / 100,
        currency: order.currency,
        items: [
          {
            id: order.id,
            name: productName,
            quantity: order.quantity,
            unitPricePaise,
            lineTotalPaise: totalAmountPaise,
          },
        ],
        latestPayment: order.payments[0]
          ? {
              id: order.payments[0].id,
              merchantOrderId: order.payments[0].merchantOrderId,
              status: order.payments[0].status,
              checkoutUrl: order.payments[0].checkoutUrl,
            }
          : null,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
      },
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
