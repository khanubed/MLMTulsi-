import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/auth';
import { formatErrorResponse, NotFoundError, UnauthorizedError } from '@/lib/errors';

/**
 * GET /api/v1/me/orders/:orderId/registration-status
 * Reads persisted order payment and MLM network registration outcome.
 * Securely authorized for the order's owner or matching checkout session.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const auth = await getAuthContext(request);
    const sessionIdHeader = request.headers.get('x-session-id');

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    const whereClause = isUuid ? { id: orderId } : { orderNumber: orderId };

    const order = await prisma.order.findFirst({
      where: whereClause,
      include: {
        checkoutSession: {
          select: { id: true },
        },
        qualifyingId: {
          select: {
            id: true,
            publicId: true,
            referralCode: true,
            status: true,
            placementDepth: true,
            createdAt: true,
          },
        },
        targetNetworkId: {
          select: {
            id: true,
            publicId: true,
            referralCode: true,
            status: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError(`Order "${orderId}" not found`);
    }

    // Access authorization: authenticated owner OR active checkout session holder
    const isOwner = auth?.userId && order.userId === auth.userId;
    const isSessionHolder = sessionIdHeader && order.checkoutSession?.id === sessionIdHeader;

    if (!isOwner && !isSessionHolder && auth?.role !== 'SUPER_ADMIN' && auth?.role !== 'ADMIN') {
      // In development/test mode without session token, allow if order has no user yet or matches bearer demo
      const isDevPermitted =
        process.env.NODE_ENV !== 'production' && (!order.userId || auth?.userId === 'demo-user-id');

      if (!isDevPermitted) {
        throw new UnauthorizedError('You are not authorized to view this order status');
      }
    }

    const assignedNetwork = order.qualifyingId || order.targetNetworkId;

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmountPaise: Number(order.totalAmountPaise),
        amountRupees: Number(order.totalAmountPaise) / 100,
        currency: order.currency,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        isRegistered: !!assignedNetwork,
        network: assignedNetwork
          ? {
              publicId: assignedNetwork.publicId,
              referralCode: assignedNetwork.referralCode,
              status: assignedNetwork.status,
            }
          : null,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
