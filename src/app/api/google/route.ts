import { NextRequest, NextResponse } from 'next/server';
import { GoogleRequestSchema, enforceRateLimit, logEvent, logError, requireFirebaseUser } from '@/lib/server/voice-helpers';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const rl = enforceRateLimit(req);
  if (rl) return rl;

  try {
    const rawBody = await req.text();
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const validated = GoogleRequestSchema.safeParse(parsedBody);
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid Google Assistant request', details: validated.error.flatten() }, { status: 400 });
    }

    // TODO: Validate Google Assistant / Dialogflow signature or JWT if provided by the platform.
    const platformSignature = req.headers.get('x-google-assistant-signature') || req.headers.get('authorization');
    if (!platformSignature) {
      return NextResponse.json({ error: 'Missing platform signature/auth header' }, { status: 401 });
    }

    let uid: string | null = null;
    try {
      ({ uid } = await requireFirebaseUser(req));
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = validated.data;
    const intent =
      body.handler?.name ||
      body.intent?.name ||
      body.queryResult?.intent?.displayName ||
      'Default Welcome Intent';

    logEvent('google_assistant_request', { intent, uid });

    let fulfillmentText = "Welcome to Proveniq Home on Google Assistant.";

    if (intent === 'Default Welcome Intent') {
      fulfillmentText = "Hi! I'm your Proveniq Home assistant. What can I do for you?";
    } else {
      fulfillmentText = "I heard you, but I don't have a specific action for that yet.";
    }

    const response = {
      fulfillmentText,
      payload: {
        google: {
          expectUserResponse: true,
          richResponse: {
            items: [
              {
                simpleResponse: {
                  textToSpeech: fulfillmentText,
                  displayText: fulfillmentText,
                },
              },
            ],
            suggestions: [{ title: 'Check my inventory' }, { title: 'Add item' }],
          },
        },
      },
      source: 'proveniq-voice-bridge',
    };

    return NextResponse.json(response);
  } catch (error) {
    logError("google_assistant_request", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
