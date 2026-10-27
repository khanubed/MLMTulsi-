import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { formatErrorResponse } from '@/lib/errors';
import { prisma } from '@/lib/db';

/**
 * GET /api/v1/me/addresses
 * Returns saved addresses for the authenticated member.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    const addresses = await prisma.address.findMany({
      where: { userId: auth.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: auth.userId,
        count: addresses.length,
        addresses: addresses.map((addr) => ({
          id: addr.id,
          fullName: addr.fullName,
          phone: addr.phone,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2,
          landmark: addr.landmark,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country,
          isDefault: addr.isDefault,
          createdAt: addr.createdAt,
        })),
      },
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
