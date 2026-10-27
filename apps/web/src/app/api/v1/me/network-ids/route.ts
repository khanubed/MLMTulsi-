import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { formatErrorResponse } from '@/lib/errors';
import { NetworkService } from '@/modules/network/network.service';

/**
 * GET /api/v1/me/network-ids
 * Lists all NetworkIds owned by the authenticated member.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const nodes = await NetworkService.listUserNetworkIds(auth.userId);

    return NextResponse.json({
      success: true,
      data: {
        userId: auth.userId,
        totalNodes: nodes.length,
        nodes,
      },
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
