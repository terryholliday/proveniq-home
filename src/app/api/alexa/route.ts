import { NextRequest, NextResponse } from 'next/server';
import { AlexaRequestSchema, enforceRateLimit, logEvent, logError, requireFirebaseUser } from '@/lib/server/voice-helpers';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const rl = enforceRateLimit(req);
  if (rl) return rl;

  // TODO: Perform full Alexa signature verification (Signature & SignatureCertChainUrl) using the raw body.
  const signature = req.headers.get('signature');
  const certUrl = req.headers.get('signaturecertchainurl');
  if (!signature || !certUrl) {
    return NextResponse.json({ error: 'Missing Alexa signature headers' }, { status: 401 });
  }

  try {
    const rawBody = await req.text();
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const validated = AlexaRequestSchema.safeParse(parsedBody);
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid Alexa request', details: validated.error.flatten() }, { status: 400 });
    }

    let uid: string | null = null;
    try {
      ({ uid } = await requireFirebaseUser(req));
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { request } = validated.data;
    const intentName = request.type === 'IntentRequest' ? request.intent?.name : undefined;

    logEvent('alexa_request', { type: request.type, intent: intentName, uid });

    let responseText = "Welcome to Proveniq Home. How can I help you today?";
    let shouldEndSession = false;

    if (request.type === 'IntentRequest') {
      switch (intentName) {
        case 'AMAZON.HelpIntent':
          responseText = "You can ask about your inventory or recent items you've added.";
          break;
        case 'AMAZON.StopIntent':
        case 'AMAZON.CancelIntent':
          responseText = "Goodbye!";
          shouldEndSession = true;
          break;
        default:
          responseText = "I heard you, but I don't have a specific action for that yet.";
      }
    } else if (request.type === 'SessionEndedRequest') {
      responseText = "Session ended.";
      shouldEndSession = true;
    }

    const response = {
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: responseText,
        },
        shouldEndSession,
        reprompt: shouldEndSession
          ? undefined
          : {
              outputSpeech: {
                type: "PlainText",
                text: "What would you like to do next?",
              },
            },
      },
      sessionAttributes: {
        uid,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logError('alexa_request', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
