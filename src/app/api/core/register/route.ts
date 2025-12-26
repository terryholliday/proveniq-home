/**
 * @file api/core/register/route.ts
 * @description API route for PAID registration with Core
 */

import { NextRequest, NextResponse } from 'next/server';
import { coreClient, toPAIDRegistrationRequest } from '@/services/core-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.userId || !body.item) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, item' },
        { status: 400 }
      );
    }

    if (!body.item.id || !body.item.name || !body.item.category) {
      return NextResponse.json(
        { error: 'Item missing required fields: id, name, category' },
        { status: 400 }
      );
    }

    const registrationRequest = toPAIDRegistrationRequest(body.userId, body.item);
    const result = await coreClient.registerAsset(registrationRequest);

    if (!result) {
      return NextResponse.json(
        { error: 'PAID registration failed', registered: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      registered: true,
      paid: result.paid,
      record: result,
    });
  } catch (error) {
    console.error('[API] Core registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
