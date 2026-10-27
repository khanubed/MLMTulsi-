import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { formatErrorResponse, ForbiddenError } from '@/lib/errors';
import { prisma } from '@/lib/db';
import { CommissionsService } from '@/modules/commissions/commissions.service';
import { CommissionStatus } from '@prisma/client';

/**
 * GET /api/v1/me/commissions
 * Returns paginated commission ledger history for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);

    const level = searchParams.get('level') ? parseInt(searchParams.get('level')!, 10) : undefined;
    const status = searchParams.get('status') as CommissionStatus | undefined;
    const networkId = searchParams.get('networkId') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;

    if (networkId) {
      const owned = await prisma.networkId.findUnique({
        where: { id: networkId },
        select: { ownerUserId: true },
      });
      if (owned && owned.ownerUserId !== auth.userId && auth.role !== 'SUPER_ADMIN' && auth.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have permission to view commissions for this Network ID');
      }
    }

    const result = await CommissionsService.listUserCommissions(auth.userId, {
      level,
      status,
      networkId,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
