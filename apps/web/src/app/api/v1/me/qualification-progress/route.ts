import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { formatErrorResponse, ForbiddenError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/db';
import { CommissionsService } from '@/modules/commissions/commissions.service';

/**
 * GET /api/v1/me/qualification-progress
 * Returns Level 1 direct-purchase milestone progress (0/3..3/3).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const requestedNetworkId = searchParams.get('networkId');

    let targetNetworkId: string;

    if (requestedNetworkId) {
      const owned = await prisma.networkId.findUnique({
        where: { id: requestedNetworkId },
        select: { id: true, ownerUserId: true },
      });

      if (!owned) {
        throw new NotFoundError(`Network ID "${requestedNetworkId}" not found`);
      }

      if (owned.ownerUserId !== auth.userId && auth.role !== 'SUPER_ADMIN' && auth.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have permission to view qualification for this Network ID');
      }

      targetNetworkId = owned.id;
    } else {
      const primary = await prisma.networkId.findFirst({
        where: { ownerUserId: auth.userId },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });

      if (!primary) {
        return NextResponse.json({
          success: true,
          data: {
            networkId: null,
            planVersion: 'tulsi-v1',
            directPurchaseCount: 0,
            requiredDirectPurchases: 3,
            progressPercentage: 0,
            isCompleted: false,
            rewardIssued: false,
            rewardAmountRupees: 0,
            completedAt: null,
          },
        });
      }

      targetNetworkId = primary.id;
    }

    const progress = await CommissionsService.getQualificationProgress(targetNetworkId);

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
