import { NextResponse } from 'next/server';
import { formatErrorResponse } from '@/lib/errors';
import { WalletService } from '@/modules/wallet/wallet.service';
import { CommissionsService } from '@/modules/commissions/commissions.service';

export async function GET() {
  try {
    const [balances, commissions] = await Promise.all([
      WalletService.getWalletBalances('demo-user'),
      CommissionsService.listUserCommissions('demo-user'),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        balances,
        commissions,
      },
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
