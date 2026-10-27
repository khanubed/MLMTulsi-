import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { formatErrorResponse, ForbiddenError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/db';
import { CommissionsService } from '@/modules/commissions/commissions.service';

/**
 * GET /api/v1/me/commissions/summary
 * Reads precomputed NetworkLevelSummary for all 10 levels.
 * O(1) indexed read without table aggregation.
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
        throw new ForbiddenError('You do not have permission to view commission summary for this Network ID');
      }

      targetNetworkId = owned.id;
    } else {
      // Find primary active network ID for member
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
            currency: 'INR',
            totalEarnedPaise: 0,
            totalHeldPaise: 0,
            totalAvailablePaise: 0,
            totalPaidPaise: 0,
            totalReversedPaise: 0,
            totalEarnedRupees: 0,
            totalAvailableRupees: 0,
            levels: Array.from({ length: 10 }, (_, i) => ({
              levelNumber: i + 1,
              earnedAmountPaise: 0,
              heldAmountPaise: 0,
              availableAmountPaise: 0,
              paidAmountPaise: 0,
              reversedAmountPaise: 0,
              levelwiseTotalRupees: 0,
              currency: 'INR',
            })),
          },
        });
      }

      targetNetworkId = primary.id;
    }

    const summary = await CommissionsService.getCommissionsSummary(targetNetworkId);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
