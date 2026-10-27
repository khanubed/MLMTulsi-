/**
 * Authoritative Commission Plan Configuration for Tulsi Swarojgar.
 *
 * IMPORTANT ARCHITECTURAL RULE:
 * This code-level configuration is the authoritative runtime source of truth.
 * Runtime payout calculations MUST NOT query mutable database rule tables to retrieve amounts.
 */

export const COMMISSION_PLAN = {
  version: 'tulsi-v1',
  maxDirectChildren: 3,
  maxDepth: 10,

  levelOneMilestone: {
    level: 1,
    requiredDirectPurchases: 3,
    rewardPaise: 50_000, // ₹500 in integer paise
    rewardType: 'ONE_TIME_MILESTONE',
  },

  ancestorRatesPaise: {
    2: 10_000, // ₹100
    3: 7_500,  // ₹75
    4: 5_000,  // ₹50
    5: 2_500,  // ₹25
    6: 1_500,  // ₹15
    7: 1_000,  // ₹10
    8: 500,    // ₹5
    9: 300,    // ₹3
    10: 100,   // ₹1
  } as Record<number, number>,
} as const;

export function getAncestorRatePaise(relativeLevel: number): number {
  if (relativeLevel === 1) {
    return COMMISSION_PLAN.levelOneMilestone.rewardPaise;
  }
  return COMMISSION_PLAN.ancestorRatesPaise[relativeLevel] || 0;
}

export function isLevelOneMilestone(relativeLevel: number): boolean {
  return relativeLevel === 1;
}
