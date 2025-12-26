/**
 * @file api/core/fraud-screen/route.ts
 * @description API route for fraud pre-screening before claims
 */

import { NextRequest, NextResponse } from 'next/server';
import { coreClient, toFraudScreeningRequest } from '@/services/core-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.userId || !body.item) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, item' },
        { status: 400 }
      );
    }

    if (!body.item.id || !body.item.category) {
      return NextResponse.json(
        { error: 'Item missing required fields: id, category' },
        { status: 400 }
      );
    }

    const claimType = body.claimType || 'insurance';
    const screeningRequest = toFraudScreeningRequest(body.userId, body.item, claimType);
    const result = await coreClient.screenForFraud(screeningRequest);

    return NextResponse.json({
      screened: true,
      result,
      canProceed: result.recommendation !== 'AUTO_DENY',
      requiresReview: result.recommendation === 'MANUAL_REVIEW' || result.recommendation === 'ESCALATE',
    });
  } catch (error) {
    console.error('[API] Core fraud screening error:', error);
    return NextResponse.json(
      { error: 'Fraud screening failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
