import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth } from '../firebase-admin';

// Simple in-memory rate limiter (best effort, process-local).
const rateBuckets = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = Number(process.env.VOICE_RATE_LIMIT || 60);
const RATE_WINDOW_MS = Number(process.env.VOICE_RATE_WINDOW_MS || 60_000);

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    req.headers.get('cf-connecting-ip')?.trim() ||
    req.headers.get('x-client-ip')?.trim() ||
    'unknown'
  );
}

export function enforceRateLimit(req: NextRequest): NextResponse | null {
  // NextRequest does not expose the IP directly; rely on proxy headers instead.
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  const ip = getClientIp(req);
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (bucket && bucket.reset > now) {
    if (bucket.count >= RATE_LIMIT) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    bucket.count += 1;
    rateBuckets.set(ip, bucket);
    return null;
  }
  rateBuckets.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
  return null;
}

export async function requireFirebaseUser(req: NextRequest): Promise<{ uid: string }> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing Authorization bearer token');
  }
  const token = authHeader.slice('Bearer '.length);
  const decoded = await adminAuth.verifyIdToken(token);
  return { uid: decoded.uid };
}

// Schemas
export const AlexaRequestSchema = z.object({
  request: z.object({
    type: z.string(),
    intent: z
      .object({
        name: z.string(),
      })
      .partial()
      .optional(),
  }),
  session: z.record(z.any()).optional(),
});

export type AlexaRequest = z.infer<typeof AlexaRequestSchema>;

export const GoogleRequestSchema = z.object({
  handler: z.object({ name: z.string().optional() }).optional(),
  intent: z.object({ name: z.string().optional() }).optional(),
  queryResult: z
    .object({
      intent: z.object({ displayName: z.string().optional() }).optional(),
    })
    .optional(),
});

export type GoogleAssistantRequest = z.infer<typeof GoogleRequestSchema>;

export function logEvent(context: string, details: Record<string, unknown>) {
  const sanitized = Object.entries(details).reduce<Record<string, unknown>>((acc, [k, v]) => {
    if (typeof v === 'string' && v.length > 500) {
      acc[k] = `${v.slice(0, 500)}…`;
    } else {
      acc[k] = v;
    }
    return acc;
  }, {});
  console.info(JSON.stringify({ event: `voice_${context}`, ...sanitized }));
}

export function logError(context: string, error: unknown, extras: Record<string, unknown> = {}) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error(
    JSON.stringify({
      event: `voice_${context}_error`,
      message,
      stack,
      ...extras,
    })
  );
}
