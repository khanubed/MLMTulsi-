import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { formatErrorResponse } from '@/lib/errors';
import { NetworkService } from '@/modules/network/network.service';

/**
 * GET /api/v1/me/network-ids/:id/children
 * Retrieves authorized direct placement slots 1..3 and children under an owned NetworkId.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const result = await NetworkService.getDirectChildren(id, auth.userId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
