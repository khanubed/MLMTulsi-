import { Prisma, CommissionStatus } from '@prisma/client';
import { logger } from '../../lib/logger';
import { COMMISSION_PLAN } from './commission-plan';
import { CommissionSummaryService } from './commission-summary.service';

export interface CreateCommissionLedgerEntryInput {
  beneficiaryNetworkId: string;
  sourceNetworkId: string;
  sourceOrderId: string;
  relativeLevel: number;
  amountPaise: number;
  rewardType: string; // LEVEL_1_MILESTONE | ANCESTOR_UPLINE
  status?: CommissionStatus;
  blockReason?: string;
  idempotencyKey: string;
  levelCompleteAt?: Date;
  milestoneQualificationId?: string;
}

export class CommissionLedgerService {
  /**
   * Idempotently writes a commission to the financial ledger and updates the precomputed level summary.
   * Runs within the outer transaction.
   */
  static async recordCommissionEntry(
    input: CreateCommissionLedgerEntryInput,
    tx: Prisma.TransactionClient
  ) {
    const {
      beneficiaryNetworkId,
      sourceNetworkId,
      sourceOrderId,
      relativeLevel,
      amountPaise,
      rewardType,
      status = CommissionStatus.HELD,
      blockReason,
      idempotencyKey,
      levelCompleteAt,
    } = input;

    // 1. Idempotency Check: Return existing record if already created
    const existing = await tx.commission.findUnique({
      where: { idempotencyKey },
    });

    if (existing) {
      logger.info('Commission ledger entry already exists (idempotent); returning existing record.', {
        meta: { idempotencyKey, commissionId: existing.id },
      });
      return { commission: existing, alreadyExisted: true };
    }

    // 2. Fetch or create active CommissionRuleSet for relational schema audit
    let ruleSet = await tx.commissionRuleSet.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
    });

    if (!ruleSet) {
      ruleSet = await tx.commissionRuleSet.create({
        data: {
          version: 1,
          name: 'Official Tulsi Swarojgar Schedule v1',
          isActive: true,
        },
      });
    }

    // 3. Insert Commission Ledger row
    const commission = await tx.commission.create({
      data: {
        beneficiaryNetworkId,
        sourceNetworkId,
        sourceOrderId,
        relativeLevel,
        amountPaise: BigInt(amountPaise),
        ruleSetId: ruleSet.id,
        planVersion: COMMISSION_PLAN.version,
        rewardType,
        status,
        blockReason,
        idempotencyKey,
        levelCompleteAt,
      },
    });

    // 4. Atomically update NetworkLevelSummary only if commission is active/earned (not BLOCKED)
    if (status !== CommissionStatus.BLOCKED && amountPaise > 0) {
      await CommissionSummaryService.recordCommissionCreated(
        beneficiaryNetworkId,
        relativeLevel,
        BigInt(amountPaise),
        status,
        tx
      );
    }

    logger.info('Commission ledger entry recorded and summary updated', {
      meta: {
        commissionId: commission.id,
        beneficiaryNetworkId,
        relativeLevel,
        amountPaise,
        rewardType,
        status,
      },
    });

    return { commission, alreadyExisted: false };
  }
}
