/**
 * @file api/core/health/route.ts
 * @description API route to check Core service availability
 */

import { NextResponse } from 'next/server';
import { coreClient } from '@/services/core-client';

export async function GET() {
  try {
    const health = await coreClient.checkHealth();

    return NextResponse.json({
      core: {
        available: health.available,
        latencyMs: health.latencyMs,
        status: health.available ? 'connected' : 'unavailable',
      },
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Core health check error:', error);
    return NextResponse.json({
      core: {
        available: false,
        latencyMs: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      checkedAt: new Date().toISOString(),
    });
  }
}
