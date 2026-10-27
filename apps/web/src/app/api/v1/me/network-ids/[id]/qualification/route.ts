import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { formatErrorResponse, ForbiddenError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/db';
import { CommissionsService } from '@/modules/commissions/commissions.service';

/**
 * GET /api/v1/me/network-ids/:id/qualification
 * Returns Level 1 qualification progress specifically for the owned Network ID.
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
      throw new ForbiddenError('You do not have permission to view qualification for this Network ID');
    }

    const progress = await CommissionsService.getQualificationProgress(node.id);

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
