import { CommissionStatus } from '@prisma/client';

export interface LevelwiseTotalItem {
  levelNumber: number;
  earnedAmountPaise: number;
  heldAmountPaise: number;
  availableAmountPaise: number;
  paidAmountPaise: number;
  reversedAmountPaise: number;
  levelwiseTotalRupees: number;
  currency: 'INR';
}

export interface CommissionSummaryResponse {
  networkId: string;
  publicId?: string;
  currency: 'INR';
  totalEarnedPaise: number;
  totalHeldPaise: number;
  totalAvailablePaise: number;
  totalPaidPaise: number;
  totalReversedPaise: number;
  totalEarnedRupees: number;
  totalAvailableRupees: number;
  levels: LevelwiseTotalItem[];
}

export interface QualificationProgressResponse {
  networkId: string;
  planVersion: string;
  directPurchaseCount: number;
  requiredDirectPurchases: number;
  progressPercentage: number;
  isCompleted: boolean;
  rewardIssued: boolean;
  rewardAmountRupees: number;
  completedAt: Date | null;
}

export interface AncestorPathNode {
  relativeLevel: number;
  networkId: string;
  ownerUserId: string;
  publicId: string;
  status: string;
  parentNetworkId: string | null;
  slotNumber: number;
}

export interface CommissionProcessingResult {
  orderId: string;
  buyerNetworkId: string;
  isInitialRegistration: boolean;
  totalEvaluatedAncestors: number;
  level1MilestoneAwarded: boolean;
  uplineCommissionsAwarded: number;
  commissionsCreated: Array<{
    beneficiaryNetworkId: string;
    relativeLevel: number;
    amountPaise: number;
    rewardType: string;
    status: CommissionStatus;
    idempotencyKey?: string | null;
  }>;
}

export interface DiscrepancyReportItem {
  networkId: string;
  levelNumber: number;
  field: string;
  summaryAmountPaise: number;
  ledgerAmountPaise: number;
  differencePaise: number;
}

export interface ReconciliationReport {
  timestamp: string;
  networksAudited: number;
  hasDiscrepancies: boolean;
  discrepancies: DiscrepancyReportItem[];
}
