import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { formatErrorResponse, ForbiddenError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/db';
import { CommissionsService } from '@/modules/commissions/commissions.service';
import { CommissionStatus } from '@prisma/client';

/**
 * GET /api/v1/me/network-ids/:id/commissions
 * Lists paginated commissions specifically for the owned Network ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const where = isUuid ? { id } : { publicId: id };

    const node = await prisma.networkId.findFirst({
      where,
      select: { id: true, ownerUserId: true },
    });

    if (!node) {
      throw new NotFoundError(`Network ID "${id}" not found`);
    }

    if (node.ownerUserId !== auth.userId && auth.role !== 'SUPER_ADMIN' && auth.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to view commissions for this Network ID');
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') ? parseInt(searchParams.get('level')!, 10) : undefined;
    const status = searchParams.get('status') as CommissionStatus | undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;

    const result = await CommissionsService.listUserCommissions(auth.userId, {
      networkId: node.id,
      level,
      status,
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
