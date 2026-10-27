import { logger } from '../../lib/logger';

export class AdminService {
  static async getOperationalOverview() {
    logger.info('Fetching admin operational overview');
    return {
      activeNetworkIds: 1,
      totalOrders: 0,
      pendingCommissionApprovalCount: 0,
      pendingWithdrawalCount: 0,
    };
  }

  static async approveCommission(commissionId: string, adminUserId: string) {
    logger.info('Approving held commission', { meta: { commissionId, adminUserId } });
    return {
      commissionId,
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
    };
  }

  static async approveWithdrawal(withdrawalId: string, adminUserId: string) {
    logger.info('Approving withdrawal payout', { meta: { withdrawalId, adminUserId } });
    return {
      withdrawalId,
      status: 'APPROVED_FOR_PAYOUT',
      approvedAt: new Date().toISOString(),
    };
  }
}
