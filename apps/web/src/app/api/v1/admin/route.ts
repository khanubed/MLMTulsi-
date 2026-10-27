import { NextResponse } from 'next/server';
import { formatErrorResponse } from '@/lib/errors';
import { AdminService } from '@/modules/admin/admin.service';

export async function GET() {
  try {
    const overview = await AdminService.getOperationalOverview();
    return NextResponse.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    const formatted = formatErrorResponse(error);
    return NextResponse.json(formatted.body, { status: formatted.status });
  }
}
