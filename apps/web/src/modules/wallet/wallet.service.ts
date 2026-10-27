import { logger } from '../../lib/logger';

export interface WalletBalances {
  totalEarnedPaise: number;
  heldCommissionsPaise: number;
  availableWithdrawablePaise: number;
  reservedWithdrawalsPaise: number;
}

export class WalletService {
  static async getWalletBalances(userId: string): Promise<WalletBalances> {
    logger.info('Fetching wallet balances', { userId });
    return {
      totalEarnedPaise: 0,
      heldCommissionsPaise: 0,
      availableWithdrawablePaise: 0,
      reservedWithdrawalsPaise: 0,
    };
  }
}
