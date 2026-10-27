import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const checkDb = searchParams.get('checkDb') === 'true' || searchParams.get('ready') === 'true';

  let dbStatus = 'untested';
  let isHealthy = true;

  if (checkDb) {
    try {
      const prisma = await getDb();
      if (typeof prisma.$queryRaw === 'function') {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
      } else {
        dbStatus = 'stub';
      }
    } catch (error) {
      dbStatus = 'disconnected';
      isHealthy = false;
    }
  }

  const responseBody = {
    status: isHealthy ? 'healthy' : 'degraded',
    service: '@tulsi/web',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
  };

  return NextResponse.json(responseBody, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
