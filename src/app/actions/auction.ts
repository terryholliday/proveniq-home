'use server';

import crypto from 'node:crypto';
import { InventoryItem, User } from '@/lib/types';

export async function sendToAuction(item: InventoryItem, user: User) {
  const secret = process.env.TRUEARK_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error('Server misconfiguration: TRUEARK_WEBHOOK_SECRET is missing');
  }

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

  const signature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  // FIX: Dynamic URL for production support
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const targetUrl = `${baseUrl}/api/webhooks/myark`;

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-myark-signature': signature
      },
      body
    });

    if (response.status === 204) return { success: true };

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Webhook execution failed:', error);
    throw new Error(error.message || 'Failed to send to auction');
  }
}
