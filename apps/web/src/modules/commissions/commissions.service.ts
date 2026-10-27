import { Prisma, CommissionStatus } from '@prisma/client';
import { prisma } from '../../lib/db';
import { logger } from '../../lib/logger';
import { COMMISSION_PLAN, getAncestorRatePaise } from './commission-plan';
import { CommissionSummaryService } from './commission-summary.service';
import { CommissionQualificationService } from './commission-qualification.service';
import { CommissionEngineService } from './commission-engine.service';
import { CommissionSummaryResponse, QualificationProgressResponse } from './commission.types';

export interface CommissionListFilters {
  level?: number;
  status?: CommissionStatus;
  networkId?: string;
  page?: number;
  limit?: number;
}

export const OFFICIAL_COMMISSION_SCHEDULE = Array.from({ length: 10 }, (_, i) => {
  const level = i + 1;
  return {
    level,
    amountRupees: getAncestorRatePaise(level) / 100,
    amountPaise: getAncestorRatePaise(level),
  };
});


export class CommissionsService {
  /**
   * Authoritative lookup of configured rate for a level.
   */
  static getCommissionForLevel(level: number) {
    return {
      level,
      amountRupees: getAncestorRatePaise(level) / 100,
      amountPaise: getAncestorRatePaise(level),
    };
  }

  /**
   * Facade for allocating commissions on order finalization.
   */
  static async allocateCommissionsForOrder(
    tx: Prisma.TransactionClient,
    sourceOrderId: string,
    sourceNetworkId: string
  ) {
    const result = await CommissionEngineService.processQualifyingSale(sourceOrderId, {
      tx,
      explicitNetworkId: sourceNetworkId,
    });
    return result.commissionsCreated;
  }

  /**
   * Returns precomputed summary for a Network ID across all 10 levels.
   */
  static async getCommissionsSummary(networkId: string): Promise<CommissionSummaryResponse> {
    return CommissionSummaryService.getNetworkLevelSummaries(networkId);
  }

  /**
   * Returns Level 1 qualification progress (0/3, 1/3, 2/3, 3/3).
   */
  static async getQualificationProgress(networkId: string): Promise<QualificationProgressResponse> {
    return CommissionQualificationService.getQualificationProgress(networkId);
  }

  /**
   * Lists paginated commission ledger entries for the user's permitted Network IDs.
   */
  static async listUserCommissions(userId: string, filters: CommissionListFilters = {}) {
    logger.info('Querying user commission history', { meta: { userId, filters } });

    // 1. Fetch user's permitted Network IDs
    const userNetworks = await prisma.networkId.findMany({
      where: { ownerUserId: userId },
      select: { id: true },
    });
    const networkIds = userNetworks.map((n) => n.id);

    if (networkIds.length === 0) {
      return {
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 20,
        totalPages: 0,
        commissions: [],
      };
    }

    const targetNetworkIds = filters.networkId
      ? networkIds.filter((id) => id === filters.networkId)
      : networkIds;

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const whereClause: Prisma.CommissionWhereInput = {
      beneficiaryNetworkId: { in: targetNetworkIds },
      ...(filters.level ? { relativeLevel: filters.level } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    };

    const [total, records] = await Promise.all([
      prisma.commission.count({ where: whereClause }),
      prisma.commission.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          sourceOrder: {
            select: {
              orderNumber: true,
              totalAmountPaise: true,
              customerName: true,
              createdAt: true,
            },
          },
          sourceNetwork: {
            select: { publicId: true },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      commissions: records.map((c) => ({
        id: c.id,
        beneficiaryNetworkId: c.beneficiaryNetworkId,
        sourceNetworkPublicId: c.sourceNetwork.publicId,
        sourceOrderNumber: c.sourceOrder.orderNumber,
        relativeLevel: c.relativeLevel,
        amountPaise: Number(c.amountPaise),
        amountRupees: Number(c.amountPaise) / 100,
        rewardType: c.rewardType,
        status: c.status,
        blockReason: c.blockReason,
        createdAt: c.createdAt,
      })),
    };
  }
}