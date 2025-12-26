/**
 * @file api/core/valuation/route.ts
 * @description API route for Core valuation integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { coreClient, toValuationRequest } from '@/services/core-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id || !body.name || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, category' },
        { status: 400 }
      );
    }

    const valuationRequest = toValuationRequest(body);
    const result = await coreClient.getValuation(valuationRequest);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Core valuation error:', error);
    return NextResponse.json(
      { error: 'Valuation failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
