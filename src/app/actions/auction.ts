/// <reference types="node" />
'use server';

import crypto from 'node:crypto';
import { InventoryItem, User } from '@/lib/types';

export async function sendToAuction(item: InventoryItem, user: User) {
  // Retrieve the secret from environment variables
  const secret = process.env.TRUEARK_WEBHOOK_SECRET;

  if (!secret) {
    console.error('Missing TRUEARK_WEBHOOK_SECRET');
    throw new Error('Server misconfiguration: TRUEARK_WEBHOOK_SECRET is missing');
  }

  // Construct the payload according to requirements
  const payload = {
    eventId: `evt_${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'ITEM_LISTED',
    payload: {
      myarkId: item.id,
      sellerId: user.id,
      title: item.name,
      description: item.description,
      images: item.imageUrl ? [item.imageUrl] : [],
      valuation: {
        amount: item.marketValue || item.purchasePrice || 0,
        currency: 'USD'
      }
    }
  };

  const body = JSON.stringify(payload);

  // Calculate HMAC-SHA256 signature
  const signature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  const targetUrl = 'http://localhost:3001/api/webhooks/myark';

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-myark-signature': signature
      },
      body
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Try to parse JSON error if possible
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Webhook returned error:', errorJson);
        throw new Error(errorJson.message || errorJson.error || `Webhook failed: ${response.statusText}`);
      } catch (e) {
        throw new Error(`Webhook failed with status ${response.status}: ${errorText}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Webhook execution failed:', error);
    throw new Error(error.message || 'Failed to send to auction');
  }
}
