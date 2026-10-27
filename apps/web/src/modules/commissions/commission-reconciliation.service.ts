import { prisma } from '../../lib/db';
import { logger } from '../../lib/logger';
import { CommissionStatus } from '@prisma/client';
import { DiscrepancyReportItem, ReconciliationReport } from './commission.types';

export class CommissionReconciliationService {
  /**
   * Reconciles precomputed NetworkLevelSummary records against immutable Commission ledger truth.
   * Can be run for a single network or all networks across the platform.
   */
  static async reconcileNetworkSummaries(targetNetworkId?: string): Promise<ReconciliationReport> {
    logger.info('Starting Commission Ledger vs Summary reconciliation audit', {
      meta: { targetNetworkId: targetNetworkId || 'ALL_NETWORKS' },
    });

    const whereClause = targetNetworkId ? { id: targetNetworkId } : {};
    const networks = await prisma.networkId.findMany({
      where: whereClause,
      select: { id: true, publicId: true },
    });

    const discrepancies: DiscrepancyReportItem[] = [];

    for (const net of networks) {
      // 1. Fetch precomputed summary rows for all 10 levels
      const summaries = await prisma.networkLevelSummary.findMany({
        where: { networkId: net.id },
      });
      const summaryByLevel = new Map<number, (typeof summaries)[0]>();
      for (const s of summaries) {
        summaryByLevel.set(s.levelNumber, s);
      }

      // 2. Fetch actual ledger entries grouped by level
      const commissions = await prisma.commission.findMany({
        where: { beneficiaryNetworkId: net.id },
      });

      for (let level = 1; level <= 10; level++) {
        const levelCommissions = commissions.filter((c) => c.relativeLevel === level);

        const ledgerEarned = levelCommissions
          .filter((c) => c.status === CommissionStatus.HELD || c.status === CommissionStatus.APPROVED)
          .reduce((sum, c) => sum + Number(c.amountPaise), 0);

        const ledgerHeld = levelCommissions
          .filter((c) => c.status === CommissionStatus.HELD)
          .reduce((sum, c) => sum + Number(c.amountPaise), 0);

        const ledgerAvailable = levelCommissions
          .filter((c) => c.status === CommissionStatus.APPROVED)
          .reduce((sum, c) => sum + Number(c.amountPaise), 0);

        const ledgerReversed = levelCommissions
          .filter((c) => c.status === CommissionStatus.REVERSED)
          .reduce((sum, c) => sum + Number(c.amountPaise), 0);

        const summary = summaryByLevel.get(level);
        const summaryEarned = summary ? Number(summary.earnedAmountPaise) : 0;
        const summaryHeld = summary ? Number(summary.heldAmountPaise) : 0;
        const summaryAvailable = summary ? Number(summary.availableAmountPaise) : 0;
        const summaryReversed = summary ? Number(summary.reversedAmountPaise) : 0;

        if (summaryEarned !== ledgerEarned) {
          discrepancies.push({
            networkId: net.id,
            levelNumber: level,
            field: 'earnedAmountPaise',
            summaryAmountPaise: summaryEarned,
            ledgerAmountPaise: ledgerEarned,
            differencePaise: summaryEarned - ledgerEarned,
          });
        }

        if (summaryHeld !== ledgerHeld) {
          discrepancies.push({
            networkId: net.id,
            levelNumber: level,
            field: 'heldAmountPaise',
            summaryAmountPaise: summaryHeld,
            ledgerAmountPaise: ledgerHeld,
            differencePaise: summaryHeld - ledgerHeld,
          });
        }

        if (summaryAvailable !== ledgerAvailable) {
          discrepancies.push({
            networkId: net.id,
            levelNumber: level,
            field: 'availableAmountPaise',
            summaryAmountPaise: summaryAvailable,
            ledgerAmountPaise: ledgerAvailable,
            differencePaise: summaryAvailable - ledgerAvailable,
          });
        }

        if (summaryReversed !== ledgerReversed) {
          discrepancies.push({
            networkId: net.id,
            levelNumber: level,
            field: 'reversedAmountPaise',
            summaryAmountPaise: summaryReversed,
            ledgerAmountPaise: ledgerReversed,
            differencePaise: summaryReversed - ledgerReversed,
          });
        }
      }
    }

    const report: ReconciliationReport = {
      timestamp: new Date().toISOString(),
      networksAudited: networks.length,
      hasDiscrepancies: discrepancies.length > 0,
      discrepancies,
    };

    if (report.hasDiscrepancies) {
      logger.warn('Reconciliation audit found discrepancies between ledger and precomputed summaries', {
        meta: { totalDiscrepancies: discrepancies.length },
      });
    } else {
      logger.info('Reconciliation audit clean: All precomputed summaries match ledger source of truth.', {
        meta: { networksAudited: networks.length },
      });
    }

    return report;
  }

  /**
   * Explicit administrative repair to synchronize NetworkLevelSummary balances to ledger reality.
   */
  static async repairDiscrepancies(networkId: string): Promise<number> {
    let repairedCount = 0;

    const commissions = await prisma.commission.findMany({
      where: { beneficiaryNetworkId: networkId },
    });

    for (let level = 1; level <= 10; level++) {
      const levelCommissions = commissions.filter((c) => c.relativeLevel === level);

      const ledgerEarned = levelCommissions
        .filter((c) => c.status === CommissionStatus.HELD || c.status === CommissionStatus.APPROVED)
        .reduce((sum, c) => sum + Number(c.amountPaise), 0);

      const ledgerHeld = levelCommissions
        .filter((c) => c.status === CommissionStatus.HELD)
        .reduce((sum, c) => sum + Number(c.amountPaise), 0);

      const ledgerAvailable = levelCommissions
        .filter((c) => c.status === CommissionStatus.APPROVED)
        .reduce((sum, c) => sum + Number(c.amountPaise), 0);

      const ledgerReversed = levelCommissions
        .filter((c) => c.status === CommissionStatus.REVERSED)
        .reduce((sum, c) => sum + Number(c.amountPaise), 0);

      await prisma.networkLevelSummary.upsert({
        where: {
          networkId_levelNumber: {
            networkId,
            levelNumber: level,
          },
        },
        create: {
          networkId,
          levelNumber: level,
          earnedAmountPaise: BigInt(ledgerEarned),
          heldAmountPaise: BigInt(ledgerHeld),
          availableAmountPaise: BigInt(ledgerAvailable),
          paidAmountPaise: BigInt(0),
          reversedAmountPaise: BigInt(ledgerReversed),
        },
        update: {
          earnedAmountPaise: BigInt(ledgerEarned),
          heldAmountPaise: BigInt(ledgerHeld),
          availableAmountPaise: BigInt(ledgerAvailable),
          reversedAmountPaise: BigInt(ledgerReversed),
        },
      });

      repairedCount++;
    }

    logger.info('Repaired precomputed level summaries for network', {
      meta: { networkId, levelsRepaired: repairedCount },
    });

    return repairedCount;
  }
}
