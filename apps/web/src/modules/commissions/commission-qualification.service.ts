import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db';
import { logger } from '../../lib/logger';
import { COMMISSION_PLAN } from './commission-plan';
import { QualificationProgressResponse } from './commission.types';

export interface MilestoneEvaluationResult {
  shouldAwardMilestone: boolean;
  milestoneAmountPaise: number;
  currentCount: number;
  isAlreadyCompleted: boolean;
  qualificationId: string;
}

export class CommissionQualificationService {
  /**
   * Evaluates a direct child qualifying purchase for the direct parent's Level 1 milestone.
   *
   * LEVEL 1 MILESTONE RULES:
   * - Progress: 0/3 -> ₹0, 1/3 -> ₹0, 2/3 -> ₹0, 3/3 -> ₹500 (one-time).
   * - 4th purchase does NOT issue a second milestone.
   * - Idempotency: same order or same child cannot count twice.
   */
  static async evaluateDirectChildPurchase(
    parentNetworkId: string,
    childNetworkId: string,
    orderId: string,
    tx: Prisma.TransactionClient
  ): Promise<MilestoneEvaluationResult> {
    const planVersion = COMMISSION_PLAN.version;
    const required = COMMISSION_PLAN.levelOneMilestone.requiredDirectPurchases;

    // 1. Upsert Level1Qualification record
    let qualification = await tx.level1Qualification.findUnique({
      where: {
        networkId_planVersion: {
          networkId: parentNetworkId,
          planVersion,
        },
      },
    });

    if (!qualification) {
      qualification = await tx.level1Qualification.create({
        data: {
          networkId: parentNetworkId,
          planVersion,
          directPurchaseCount: 0,
          isCompleted: false,
          rewardIssued: false,
        },
      });
    }

    // If milestone reward has already been issued, return early without duplicate award
    if (qualification.rewardIssued) {
      return {
        shouldAwardMilestone: false,
        milestoneAmountPaise: 0,
        currentCount: qualification.directPurchaseCount,
        isAlreadyCompleted: true,
        qualificationId: qualification.id,
      };
    }

    // 2. Check if this order or child position has already contributed
    const existingEvent = await tx.level1QualificationEvent.findFirst({
      where: {
        qualificationId: qualification.id,
        OR: [{ orderId }, { childNetworkId }],
      },
    });

    if (existingEvent) {
      logger.info('Direct child qualifying event already recorded for Level 1 milestone; skipping duplicate count.', {
        meta: { parentNetworkId, childNetworkId, orderId },
      });
      return {
        shouldAwardMilestone: false,
        milestoneAmountPaise: 0,
        currentCount: qualification.directPurchaseCount,
        isAlreadyCompleted: qualification.isCompleted,
        qualificationId: qualification.id,
      };
    }

    // 3. Record new qualification event
    await tx.level1QualificationEvent.create({
      data: {
        qualificationId: qualification.id,
        orderId,
        childNetworkId,
      },
    });

    // 4. Count total distinct events
    const currentCount = await tx.level1QualificationEvent.count({
      where: { qualificationId: qualification.id },
    });

    const isCompleted = currentCount >= required;
    const shouldAwardMilestone = isCompleted && !qualification.rewardIssued;

    // 5. Update qualification record
    await tx.level1Qualification.update({
      where: { id: qualification.id },
      data: {
        directPurchaseCount: currentCount,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        rewardIssued: shouldAwardMilestone ? true : qualification.rewardIssued,
      },
    });

    logger.info('Level 1 direct purchase evaluated', {
      meta: {
        parentNetworkId,
        childNetworkId,
        currentCount,
        required,
        shouldAwardMilestone,
      },
    });

    return {
      shouldAwardMilestone,
      milestoneAmountPaise: shouldAwardMilestone ? COMMISSION_PLAN.levelOneMilestone.rewardPaise : 0,
      currentCount,
      isAlreadyCompleted: qualification.isCompleted,
      qualificationId: qualification.id,
    };
  }

  /**
   * Retrieves Level 1 milestone progress for a specific Network ID.
   */
  static async getQualificationProgress(
    networkId: string,
    planVersion: string = COMMISSION_PLAN.version
  ): Promise<QualificationProgressResponse> {
    const required = COMMISSION_PLAN.levelOneMilestone.requiredDirectPurchases;

    const qualification = await prisma.level1Qualification.findUnique({
      where: {
        networkId_planVersion: {
          networkId,
          planVersion,
        },
      },
    });

    const count = qualification?.directPurchaseCount || 0;
    const isCompleted = qualification?.isCompleted || false;
    const rewardIssued = qualification?.rewardIssued || false;
    const progressPercentage = Math.min(100, Math.round((count / required) * 100));

    return {
      networkId,
      planVersion,
      directPurchaseCount: count,
      requiredDirectPurchases: required,
      progressPercentage,
      isCompleted,
      rewardIssued,
      rewardAmountRupees: rewardIssued ? COMMISSION_PLAN.levelOneMilestone.rewardPaise / 100 : 0,
      completedAt: qualification?.completedAt || null,
    };
  }
}
