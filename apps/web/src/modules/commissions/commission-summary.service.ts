import { Prisma, CommissionStatus } from '@prisma/client';
import { prisma } from '../../lib/db';
import { logger } from '../../lib/logger';
import { CommissionSummaryResponse, LevelwiseTotalItem } from './commission.types';

export class CommissionSummaryService {
  /**
   * Pre-initializes all 10 levels in NetworkLevelSummary with zero amounts for a newly registered NetworkId.
   * Safe to call repeatedly (idempotent).
   */
  static async initializeSummariesForNetwork(
    networkId: string,
    txClient?: Prisma.TransactionClient
  ): Promise<void> {
    const db = txClient || prisma;

    if (!db || !(db as any).networkLevelSummary?.count) {
      return;
    }

    const existingCount = await (db as any).networkLevelSummary.count({
      where: { networkId },
    });

    if (existingCount >= 10) {
      return;
    }

    const rowsToCreate: Prisma.NetworkLevelSummaryCreateManyInput[] = [];
    for (let level = 1; level <= 10; level++) {
      rowsToCreate.push({
        networkId,
        levelNumber: level,
        earnedAmountPaise: BigInt(0),
        heldAmountPaise: BigInt(0),
        availableAmountPaise: BigInt(0),
        paidAmountPaise: BigInt(0),
        reversedAmountPaise: BigInt(0),
      });
    }

    await db.networkLevelSummary.createMany({
      data: rowsToCreate,
      skipDuplicates: true,
    });

    logger.debug('Precomputed NetworkLevelSummary rows initialized for all 10 levels', {
      meta: { networkId },
    });
  }

  /**
   * Incrementally updates NetworkLevelSummary when a new commission ledger entry is created.
   * Must run inside the commission creation transaction.
   */
  static async recordCommissionCreated(
    networkId: string,
    levelNumber: number,
    amountPaise: bigint,
    status: CommissionStatus,
    tx: Prisma.TransactionClient
  ): Promise<void> {
    // Ensure row exists before increment
    await this.initializeSummariesForNetwork(networkId, tx);

    if (status === CommissionStatus.HELD) {
      await tx.networkLevelSummary.update({
        where: {
          networkId_levelNumber: {
            networkId,
            levelNumber,
          },
        },
        data: {
          earnedAmountPaise: { increment: amountPaise },
          heldAmountPaise: { increment: amountPaise },
        },
      });
    } else if (status === CommissionStatus.APPROVED) {
      await tx.networkLevelSummary.update({
        where: {
          networkId_levelNumber: {
            networkId,
            levelNumber,
          },
        },
        data: {
          earnedAmountPaise: { increment: amountPaise },
          availableAmountPaise: { increment: amountPaise },
        },
      });
    }
  }

  /**
   * Incrementally updates totals when a commission transitions status (e.g. HELD -> APPROVED).
   */
  static async recordCommissionStatusTransition(
    networkId: string,
    levelNumber: number,
    amountPaise: bigint,
    fromStatus: CommissionStatus,
    toStatus: CommissionStatus,
    tx: Prisma.TransactionClient
  ): Promise<void> {
    if (fromStatus === toStatus) return;

    await this.initializeSummariesForNetwork(networkId, tx);

    const dataUpdates: Prisma.NetworkLevelSummaryUpdateInput = {};

    // Decrement previous state
    if (fromStatus === CommissionStatus.HELD) {
      dataUpdates.heldAmountPaise = { decrement: amountPaise };
    } else if (fromStatus === CommissionStatus.APPROVED) {
      dataUpdates.availableAmountPaise = { decrement: amountPaise };
    }

    // Increment new state
    if (toStatus === CommissionStatus.APPROVED) {
      dataUpdates.availableAmountPaise = { increment: amountPaise };
    } else if (toStatus === CommissionStatus.REVERSED) {
      dataUpdates.reversedAmountPaise = { increment: amountPaise };
      dataUpdates.earnedAmountPaise = { decrement: amountPaise };
    }

    await tx.networkLevelSummary.update({
      where: {
        networkId_levelNumber: {
          networkId,
          levelNumber,
        },
      },
      data: dataUpdates,
    });
  }

  /**
   * Instant O(1) indexed point-read from NetworkLevelSummary.
   * Guarantees returning all 10 levels, with zero amounts for levels with no activity.
   */
  static async getNetworkLevelSummaries(networkId: string): Promise<CommissionSummaryResponse> {
    // Ensure initialized
    await this.initializeSummariesForNetwork(networkId);

    const summaryRows = await prisma.networkLevelSummary.findMany({
      where: { networkId },
      orderBy: { levelNumber: 'asc' },
    });

    const levelMap = new Map<number, (typeof summaryRows)[0]>();
    for (const row of summaryRows) {
      levelMap.set(row.levelNumber, row);
    }

    const levels: LevelwiseTotalItem[] = [];
    let totalEarnedPaise = 0;
    let totalHeldPaise = 0;
    let totalAvailablePaise = 0;
    let totalPaidPaise = 0;
    let totalReversedPaise = 0;

    for (let l = 1; l <= 10; l++) {
      const row = levelMap.get(l);
      const earned = row ? Number(row.earnedAmountPaise) : 0;
      const held = row ? Number(row.heldAmountPaise) : 0;
      const available = row ? Number(row.availableAmountPaise) : 0;
      const paid = row ? Number(row.paidAmountPaise) : 0;
      const reversed = row ? Number(row.reversedAmountPaise) : 0;

      totalEarnedPaise += earned;
      totalHeldPaise += held;
      totalAvailablePaise += available;
      totalPaidPaise += paid;
      totalReversedPaise += reversed;

      levels.push({
        levelNumber: l,
        earnedAmountPaise: earned,
        heldAmountPaise: held,
        availableAmountPaise: available,
        paidAmountPaise: paid,
        reversedAmountPaise: reversed,
        levelwiseTotalRupees: earned / 100,
        currency: 'INR',
      });
    }

    const network = await prisma.networkId.findUnique({
      where: { id: networkId },
      select: { publicId: true },
    });

    return {
      networkId,
      publicId: network?.publicId,
      currency: 'INR',
      totalEarnedPaise,
      totalHeldPaise,
      totalAvailablePaise,
      totalPaidPaise,
      totalReversedPaise,
      totalEarnedRupees: totalEarnedPaise / 100,
      totalAvailableRupees: totalAvailablePaise / 100,
      levels,
    };
  }
}
