import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CommissionEngineService } from '../src/modules/commissions/commission-engine.service';
import { CommissionSummaryService } from '../src/modules/commissions/commission-summary.service';
import { CommissionQualificationService } from '../src/modules/commissions/commission-qualification.service';
import { CommissionReconciliationService } from '../src/modules/commissions/commission-reconciliation.service';
import { HierarchyResolverService } from '../src/modules/commissions/hierarchy-resolver.service';
import { COMMISSION_PLAN, getAncestorRatePaise } from '../src/modules/commissions/commission-plan';
import { prisma } from '../src/lib/db';
import { CommissionStatus, OrderStatus, PaymentStatus } from '@prisma/client';

describe('Commission Engine & Incremental Summary System (Comprehensive Verification)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Authoritative Configuration Check
  it('1. Authoritative code configuration matches approved schedule for all 10 levels', () => {
    expect(COMMISSION_PLAN.version).toBe('tulsi-v1');
    expect(COMMISSION_PLAN.maxDepth).toBe(10);
    expect(COMMISSION_PLAN.levelOneMilestone.rewardPaise).toBe(50000); // ₹500
    expect(getAncestorRatePaise(1)).toBe(50000);
    expect(getAncestorRatePaise(2)).toBe(10000); // ₹100
    expect(getAncestorRatePaise(3)).toBe(7500);  // ₹75
    expect(getAncestorRatePaise(4)).toBe(5000);  // ₹50
    expect(getAncestorRatePaise(5)).toBe(2500);  // ₹25
    expect(getAncestorRatePaise(6)).toBe(1500);  // ₹15
    expect(getAncestorRatePaise(7)).toBe(1000);  // ₹10
    expect(getAncestorRatePaise(8)).toBe(500);   // ₹5
    expect(getAncestorRatePaise(9)).toBe(300);   // ₹3
    expect(getAncestorRatePaise(10)).toBe(100);  // ₹1
    expect(getAncestorRatePaise(11)).toBe(0);    // Beyond 10 levels = 0
  });

  // 2. Pre-initialization of 10 levels
  it('2. NetworkLevelSummary pre-initializes all 10 levels with zero balances', async () => {
    const mockCreateMany = vi.fn().mockResolvedValue({ count: 10 });
    const mockCount = vi.fn().mockResolvedValue(0);

    const mockDb = {
      networkLevelSummary: {
        count: mockCount,
        createMany: mockCreateMany,
      },
    };

    await CommissionSummaryService.initializeSummariesForNetwork('net-uuid-1', mockDb as any);

    expect(mockCreateMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ levelNumber: 1, earnedAmountPaise: BigInt(0) }),
        expect.objectContaining({ levelNumber: 2, earnedAmountPaise: BigInt(0) }),
        expect.objectContaining({ levelNumber: 10, earnedAmountPaise: BigInt(0) }),
      ]),
      skipDuplicates: true,
    });
    expect(mockCreateMany.mock.calls[0][0].data.length).toBe(10);
  });

  // 3. Level 1 Milestone: 0/3, 1/3, 2/3 produces ₹0; 3/3 produces ₹500; 4/3 produces no duplicate
  it('3. Level 1 milestone awards exactly one ₹500 reward on the 3rd purchase, 0 before, 0 after', async () => {
    let currentEventCount = 0;
    let rewardAlreadyIssued = false;

    const mockTx = {
      level1Qualification: {
        findUnique: vi.fn().mockImplementation(() =>
          Promise.resolve({
            id: 'qual-uuid-1',
            networkId: 'parent-net-1',
            planVersion: 'tulsi-v1',
            directPurchaseCount: currentEventCount,
            isCompleted: currentEventCount >= 3,
            rewardIssued: rewardAlreadyIssued,
          })
        ),
        create: vi.fn(),
        update: vi.fn().mockImplementation(({ data }) => {
          if (data.directPurchaseCount !== undefined) currentEventCount = data.directPurchaseCount;
          if (data.rewardIssued !== undefined) rewardAlreadyIssued = data.rewardIssued;
          return Promise.resolve({});
        }),
      },
      level1QualificationEvent: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(() => {
          currentEventCount++;
          return Promise.resolve({});
        }),
        count: vi.fn().mockImplementation(() => Promise.resolve(currentEventCount)),
      },
    };

    // Purchase 1: progress 1/3 -> should not award milestone
    const p1 = await CommissionQualificationService.evaluateDirectChildPurchase(
      'parent-net-1',
      'child-1',
      'order-1',
      mockTx as any
    );
    expect(p1.shouldAwardMilestone).toBe(false);
    expect(p1.currentCount).toBe(1);

    // Purchase 2: progress 2/3 -> should not award milestone
    const p2 = await CommissionQualificationService.evaluateDirectChildPurchase(
      'parent-net-1',
      'child-2',
      'order-2',
      mockTx as any
    );
    expect(p2.shouldAwardMilestone).toBe(false);
    expect(p2.currentCount).toBe(2);

    // Purchase 3: progress 3/3 -> MUST award milestone (₹500 = 50,000 paise)
    const p3 = await CommissionQualificationService.evaluateDirectChildPurchase(
      'parent-net-1',
      'child-3',
      'order-3',
      mockTx as any
    );
    expect(p3.shouldAwardMilestone).toBe(true);
    expect(p3.milestoneAmountPaise).toBe(50000);
    expect(p3.currentCount).toBe(3);

    // Purchase 4: should NOT award second milestone
    const p4 = await CommissionQualificationService.evaluateDirectChildPurchase(
      'parent-net-1',
      'child-4',
      'order-4',
      mockTx as any
    );
    expect(p4.shouldAwardMilestone).toBe(false);
    expect(p4.milestoneAmountPaise).toBe(0);
    expect(p4.isAlreadyCompleted).toBe(true);
  });

  // 4. Idempotent evaluation: same order cannot be counted twice
  it('4. Repeated callbacks with the same order do not increment direct purchase count', async () => {
    const mockTx = {
      level1Qualification: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'qual-uuid-dup',
          networkId: 'parent-net-dup',
          planVersion: 'tulsi-v1',
          directPurchaseCount: 1,
          isCompleted: false,
          rewardIssued: false,
        }),
      },
      level1QualificationEvent: {
        // Event already exists!
        findFirst: vi.fn().mockResolvedValue({ id: 'event-uuid-existing' }),
      },
    };

    const result = await CommissionQualificationService.evaluateDirectChildPurchase(
      'parent-net-dup',
      'child-dup',
      'order-dup-1',
      mockTx as any
    );

    expect(result.shouldAwardMilestone).toBe(false);
    expect(result.currentCount).toBe(1);
  });

  // 5. Strict broken-path rule halts traversal immediately
  it('5. HierarchyResolver halts traversal immediately if a placement parent link is broken', async () => {
    // Node hierarchy: child -> parent1 -> broken (null) -> parent3
    const mockDb = {
      networkPlacement: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.childNetworkId === 'child-node') {
            return Promise.resolve({
              parentNetworkId: 'parent-1',
              slotNumber: 1,
              parentNetwork: {
                id: 'parent-1',
                ownerUserId: 'user-1',
                publicId: 'TS-P1',
                status: 'ACTIVE',
                parentNetworkId: 'corrupt-parent-link', // link exists on node but placement table is broken!
              },
            });
          }
          if (where.childNetworkId === 'parent-1') {
            // Missing placement record! Corrupt / broken link!
            return Promise.resolve(null);
          }
          return Promise.resolve(null);
        }),
      },
    };

    const path = await HierarchyResolverService.resolveAncestorPath('child-node', 10, mockDb as any);

    // Only parent-1 resolved; upper ancestors not reached/skipped
    expect(path.length).toBe(1);
    expect(path[0].networkId).toBe('parent-1');
  });

  // 6. Inactive ancestor is recorded as BLOCKED
  it('6. Inactive ancestor commission is recorded with status BLOCKED and blockReason', async () => {
    const mockOrder = {
      id: 'ord-active-1',
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.SUCCESS,
      totalAmountPaise: BigInt(50000),
      currency: 'INR',
      networkIdId: 'buyer-node',
      payments: [{ status: 'SUCCESS' }],
    };

    vi.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);

    // Mock Hierarchy: buyer -> parent (L1, active) -> grandparent (L2, INACTIVE/SUSPENDED)
    vi.spyOn(HierarchyResolverService, 'resolveAncestorPath').mockResolvedValue([
      {
        relativeLevel: 1,
        networkId: 'parent-node',
        ownerUserId: 'user-p',
        publicId: 'P1',
        status: 'ACTIVE',
        parentNetworkId: 'grandparent-node',
        slotNumber: 1,
      },
      {
        relativeLevel: 2,
        networkId: 'grandparent-node',
        ownerUserId: 'user-gp',
        publicId: 'GP1',
        status: 'SUSPENDED', // Inactive ancestor!
        parentNetworkId: null,
        slotNumber: 1,
      },
    ]);

    vi.spyOn(CommissionQualificationService, 'evaluateDirectChildPurchase').mockResolvedValue({
      shouldAwardMilestone: false,
      milestoneAmountPaise: 0,
      currentCount: 1,
      isAlreadyCompleted: false,
      qualificationId: 'qual-1',
    });

    const recordedCommissions: any[] = [];
    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
      const tx = {
        order: {
          findUnique: vi.fn().mockResolvedValue(mockOrder),
        },
        commission: {
          findFirst: vi.fn().mockResolvedValue(null),
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockImplementation(({ data }) => {
            recordedCommissions.push(data);
            return Promise.resolve({ id: `comm-${recordedCommissions.length}`, ...data });
          }),
        },
        commissionRuleSet: {
          findFirst: vi.fn().mockResolvedValue({ id: 'rule-set-1' }),
        },
        networkLevelSummary: {
          count: vi.fn().mockResolvedValue(10),
          update: vi.fn().mockResolvedValue({}),
        },
      };
      return callback(tx);
    });

    const result = await CommissionEngineService.processQualifyingSale('ord-active-1');
    expect(result.uplineCommissionsAwarded).toBe(1);

    // Level 2 for suspended grandparent recorded as BLOCKED
    const l2Comm = recordedCommissions.find((c) => c.relativeLevel === 2);
    expect(l2Comm).toBeDefined();
    expect(l2Comm.status).toBe(CommissionStatus.BLOCKED);
    expect(l2Comm.blockReason).toBe('BENEFICIARY_INACTIVE');
  });

  // 7. Atomic incremental updates to NetworkLevelSummary
  it('7. CommissionSummaryService atomically increments earned and held amounts on commission creation', async () => {
    const mockUpdate = vi.fn().mockResolvedValue({});
    const mockTx = {
      networkLevelSummary: {
        count: vi.fn().mockResolvedValue(10),
        update: mockUpdate,
      },
    };

    await CommissionSummaryService.recordCommissionCreated(
      'beneficiary-uuid-1',
      2, // Level 2
      BigInt(10000), // ₹100
      CommissionStatus.HELD,
      mockTx as any
    );

    expect(mockUpdate).toHaveBeenCalledWith({
      where: {
        networkId_levelNumber: {
          networkId: 'beneficiary-uuid-1',
          levelNumber: 2,
        },
      },
      data: {
        earnedAmountPaise: { increment: BigInt(10000) },
        heldAmountPaise: { increment: BigInt(10000) },
      },
    });
  });

  // 8. Atomic transition updates: HELD -> APPROVED (held decrements, available increments)
  it('8. Status transition HELD -> APPROVED decrements held and increments available', async () => {
    const mockUpdate = vi.fn().mockResolvedValue({});
    const mockTx = {
      networkLevelSummary: {
        count: vi.fn().mockResolvedValue(10),
        update: mockUpdate,
      },
    };

    await CommissionSummaryService.recordCommissionStatusTransition(
      'beneficiary-uuid-1',
      2,
      BigInt(10000),
      CommissionStatus.HELD,
      CommissionStatus.APPROVED,
      mockTx as any
    );

    expect(mockUpdate).toHaveBeenCalledWith({
      where: {
        networkId_levelNumber: {
          networkId: 'beneficiary-uuid-1',
          levelNumber: 2,
        },
      },
      data: {
        heldAmountPaise: { decrement: BigInt(10000) },
        availableAmountPaise: { increment: BigInt(10000) },
      },
    });
  });

  // 9. Reconciliation detects discrepancies and repairs them
  it('9. CommissionReconciliationService detects corrupted summary values and repairs them', async () => {
    const netId = 'net-audit-1';

    // Summary has corrupted earned amount of 99,999 paise instead of 10,000 paise
    (prisma as any).networkId = {
      findMany: vi.fn().mockResolvedValue([{ id: netId, publicId: 'TS-AUDIT' }]),
    };

    (prisma as any).networkLevelSummary = {
      findMany: vi.fn().mockResolvedValue([
        {
          networkId: netId,
          levelNumber: 2,
          earnedAmountPaise: BigInt(99999), // Corrupted!
          heldAmountPaise: BigInt(99999),
          availableAmountPaise: BigInt(0),
          paidAmountPaise: BigInt(0),
          reversedAmountPaise: BigInt(0),
        },
      ]),
      upsert: vi.fn().mockResolvedValue({}),
    };

    (prisma as any).commission = {
      findMany: vi.fn().mockResolvedValue([
        {
          beneficiaryNetworkId: netId,
          relativeLevel: 2,
          amountPaise: BigInt(10000), // Truth is 10,000 paise
          status: CommissionStatus.HELD,
        },
      ]),
    };

    const auditReport = await CommissionReconciliationService.reconcileNetworkSummaries(netId);
    expect(auditReport.hasDiscrepancies).toBe(true);
    expect(auditReport.discrepancies.length).toBeGreaterThan(0);

    const earnedDiscrepancy = auditReport.discrepancies.find((d) => d.field === 'earnedAmountPaise');
    expect(earnedDiscrepancy).toBeDefined();
    expect(earnedDiscrepancy?.summaryAmountPaise).toBe(99999);
    expect(earnedDiscrepancy?.ledgerAmountPaise).toBe(10000);

    // Repair discrepancies
    const repaired = await CommissionReconciliationService.repairDiscrepancies(netId);
    expect(repaired).toBe(10); // All 10 levels repaired to match ledger truth
  });

  // 10. Ineligible / unpaid order produces no commission
  it('10. Pending or failed payment produces zero commissions', async () => {
    const mockTx = {
      order: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'ord-unpaid',
          status: OrderStatus.PENDING_PAYMENT,
          paymentStatus: PaymentStatus.INITIATED, // Unpaid!
          totalAmountPaise: BigInt(50000),
          currency: 'INR',
          payments: [{ status: 'INITIATED' }],
        }),
      },
    };
    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
      return callback(mockTx);
    });

    await expect(
      CommissionEngineService.processQualifyingSale('ord-unpaid')
    ).rejects.toThrow(/is not verified as paid/);
  });
});
