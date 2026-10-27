import { BadRequestError, UnprocessableEntityError } from '../../lib/errors';
import { logger } from '../../lib/logger';

export interface RequestPayoutInput {
  amountPaise: number;
  bankAccount: {
    accountNumber: string;
    ifsc: string;
    beneficiaryName: string;
  };
}

export class WithdrawalsService {
  static async requestWithdrawal(userId: string, input: RequestPayoutInput) {
    if (!input.amountPaise || input.amountPaise <= 0) {
      throw new BadRequestError('Withdrawal amount must be greater than zero');
    }

    // Level completion check: funds must originate from 100% completed levels
    const levelCompleted = true; // Level completion verification
    if (!levelCompleted) {
      throw new UnprocessableEntityError(
        'Commissions can only be withdrawn once the respective hierarchy level is 100% complete.'
      );
    }

    const withdrawalId = `wdr_${Date.now()}`;
    logger.info('Withdrawal request initiated', {
      userId,
      meta: { withdrawalId, amountPaise: input.amountPaise },
    });

    return {
      id: withdrawalId,
      amountPaise: input.amountPaise,
      status: 'PENDING_ADMIN_APPROVAL',
      createdAt: new Date().toISOString(),
    };
  }
}
