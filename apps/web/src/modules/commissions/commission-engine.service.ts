import { Prisma, OrderStatus, PaymentStatus, CommissionStatus } from '@prisma/client';
import { prisma } from '../../lib/db';
import { BadRequestError, NotFoundError } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { COMMISSION_PLAN, getAncestorRatePaise } from './commission-plan';
import { HierarchyResolverService } from './hierarchy-resolver.service';
import { CommissionQualificationService } from './commission-qualification.service';
import { CommissionLedgerService } from './commission-ledger.service';
import { CommissionProcessingResult } from './commission.types';

export interface ProcessQualifyingSaleOptions {
  tx?: Prisma.TransactionClient;
  explicitNetworkId?: string;
}

export class CommissionEngineService {
  /**
   * Single authoritative entry point to process a verified, paid qualifying sale.
   *
   * LIFECYCLE:
   * 1. Validates order and payment status.
   * 2. Detects idempotency to prevent duplicate reward distribution.
   * 3. Resolves buyer's network placement node.
   * 4. Evaluates direct parent's Level 1 milestone (3/3 -> ₹500).
   * 5. Evaluates ancestors at Levels 2 to 10 using authoritative code rates.
   * 6. Updates precomputed level summaries incrementally in the same transaction.
   */
  static async processQualifyingSale(
    orderId: string,
    options: ProcessQualifyingSaleOptions = {}
  ): Promise<CommissionProcessingResult> {
    const runInTransaction = async (tx: Prisma.TransactionClient): Promise<CommissionProcessingResult> => {
      // 1. Fetch order with payments
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          targetNetworkId: true,
          qualifyingId: true,
        },
      });

      if (!order) {
        throw new NotFoundError(`Order "${orderId}" not found for commission processing`);
      }

      // 2. Validate Payment & Order Eligibility
      const latestPayment = order.payments[0];
      const isPaid =
        (order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.PAID) &&
        (order.paymentStatus === PaymentStatus.SUCCESS || latestPayment?.status === 'SUCCESS');

      if (!isPaid) {
        throw new BadRequestError(
          `Cannot process commissions: Order "${orderId}" is not verified as paid (status: ${order.status}, payment: ${order.paymentStatus})`
        );
      }

      if (order.totalAmountPaise <= BigInt(0) || order.currency !== 'INR') {
        throw new BadRequestError(`Invalid order currency or amount for order "${orderId}"`);
      }

      // 3. Resolve buyer's NetworkId
      const buyerNetworkId =
        options.explicitNetworkId || order.networkIdId || order.qualifyingId?.id;

      if (!buyerNetworkId) {
        logger.warn('Order does not have a linked NetworkId; skipping commission calculation.', {
          meta: { orderId },
        });
        return {
          orderId,
          buyerNetworkId: '',
          isInitialRegistration: false,
          totalEvaluatedAncestors: 0,
          level1MilestoneAwarded: false,
          uplineCommissionsAwarded: 0,
          commissionsCreated: [],
        };
      }

      // 4. Idempotency Check: Check if non-milestone commissions already exist for this order
      const existingUpline = await tx.commission.findFirst({
        where: { sourceOrderId: orderId },
      });

      if (existingUpline) {
        logger.info('Order has already been processed for commissions (idempotent); returning existing state.', {
          meta: { orderId, buyerNetworkId },
        });
        const existingAll = await tx.commission.findMany({
          where: { sourceOrderId: orderId },
        });
        return {
          orderId,
          buyerNetworkId,
          isInitialRegistration: order.purpose === 'INITIAL_REGISTRATION',
          totalEvaluatedAncestors: existingAll.length,
          level1MilestoneAwarded: existingAll.some((c) => c.relativeLevel === 1),
          uplineCommissionsAwarded: existingAll.filter((c) => c.relativeLevel > 1).length,
          commissionsCreated: existingAll.map((c) => ({
            beneficiaryNetworkId: c.beneficiaryNetworkId,
            relativeLevel: c.relativeLevel,
            amountPaise: Number(c.amountPaise),
            rewardType: c.rewardType,
            status: c.status,
            idempotencyKey: c.idempotencyKey,
          })),
        };
      }

      // 5. Traverse Upline Hierarchy up to 10 levels with strict broken-path verification
      const ancestorChain = await HierarchyResolverService.resolveAncestorPath(
        buyerNetworkId,
        COMMISSION_PLAN.maxDepth,
        tx
      );

      const commissionsCreated: CommissionProcessingResult['commissionsCreated'] = [];
      let level1MilestoneAwarded = false;
      let uplineCommissionsAwarded = 0;

      // 6. Process Level 1 Direct Milestone (if Level 1 direct parent exists in ancestor chain)
      const directParent = ancestorChain.find((a) => a.relativeLevel === 1);

      if (directParent) {
        const milestoneResult = await CommissionQualificationService.evaluateDirectChildPurchase(
          directParent.networkId,
          buyerNetworkId,
          orderId,
          tx
        );

        if (milestoneResult.shouldAwardMilestone) {
          const l1IdempotencyKey = `milestone_l1_${directParent.networkId}_plan_${COMMISSION_PLAN.version}`;
          const isParentActive = directParent.status === 'ACTIVE';

          const { commission } = await CommissionLedgerService.recordCommissionEntry(
            {
              beneficiaryNetworkId: directParent.networkId,
              sourceNetworkId: buyerNetworkId,
              sourceOrderId: orderId,
              relativeLevel: 1,
              amountPaise: milestoneResult.milestoneAmountPaise,
              rewardType: COMMISSION_PLAN.levelOneMilestone.rewardType,
              status: isParentActive ? CommissionStatus.HELD : CommissionStatus.BLOCKED,
              blockReason: isParentActive ? undefined : 'BENEFICIARY_INACTIVE',
              idempotencyKey: l1IdempotencyKey,
              levelCompleteAt: new Date(),
            },
            tx
          );

          // Link milestone commission back to qualification record
          await tx.level1Qualification.update({
            where: { id: milestoneResult.qualificationId },
            data: { milestoneCommissionId: commission.id },
          });

          level1MilestoneAwarded = true;
          commissionsCreated.push({
            beneficiaryNetworkId: directParent.networkId,
            relativeLevel: 1,
            amountPaise: milestoneResult.milestoneAmountPaise,
            rewardType: COMMISSION_PLAN.levelOneMilestone.rewardType,
            status: commission.status,
            idempotencyKey: commission.idempotencyKey,
          });
        }
      }

      // 7. Process Levels 2 to 10 Ancestor Upline Commissions
      const uplineAncestors = ancestorChain.filter((a) => a.relativeLevel >= 2 && a.relativeLevel <= 10);

      for (const ancestor of uplineAncestors) {
        const ratePaise = getAncestorRatePaise(ancestor.relativeLevel);
        if (ratePaise <= 0) continue;

        const idempotencyKey = `order_${orderId}_level_${ancestor.relativeLevel}_bene_${ancestor.networkId}`;
        const isAncestorActive = ancestor.status === 'ACTIVE';

        const { commission } = await CommissionLedgerService.recordCommissionEntry(
          {
            beneficiaryNetworkId: ancestor.networkId,
            sourceNetworkId: buyerNetworkId,
            sourceOrderId: orderId,
            relativeLevel: ancestor.relativeLevel,
            amountPaise: ratePaise,
            rewardType: 'ANCESTOR_UPLINE',
            status: isAncestorActive ? CommissionStatus.HELD : CommissionStatus.BLOCKED,
            blockReason: isAncestorActive ? undefined : 'BENEFICIARY_INACTIVE',
            idempotencyKey,
          },
          tx
        );

        uplineCommissionsAwarded++;
        commissionsCreated.push({
          beneficiaryNetworkId: ancestor.networkId,
          relativeLevel: ancestor.relativeLevel,
          amountPaise: ratePaise,
          rewardType: 'ANCESTOR_UPLINE',
          status: commission.status,
          idempotencyKey: commission.idempotencyKey,
        });
      }

      logger.info('Qualifying sale commission execution completed', {
        meta: {
          orderId,
          buyerNetworkId,
          totalAncestorsEvaluated: ancestorChain.length,
          level1MilestoneAwarded,
          uplineCommissionsAwarded,
        },
      });

      return {
        orderId,
        buyerNetworkId,
        isInitialRegistration: order.purpose === 'INITIAL_REGISTRATION',
        totalEvaluatedAncestors: ancestorChain.length,
        level1MilestoneAwarded,
        uplineCommissionsAwarded,
        commissionsCreated,
      };
    };

    if (options.tx) {
      return runInTransaction(options.tx);
    } else {
      return prisma.$transaction((tx) => runInTransaction(tx), {
        timeout: 30000,
        maxWait: 10000,
      });
    }
  }
}
