import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Google Assistant Request:", JSON.stringify(body, null, 2));

    // Basic structure for Google Actions SDK / Dialogflow fulfillment
    const intent = body.handler?.name || body.intent?.name || body.queryResult?.intent?.displayName;
    
    let fulfillmentText = "Welcome to My Ark on Google Assistant.";

    if (intent === 'Default Welcome Intent') {
      fulfillmentText = "Hi! I'm your My Ark assistant. What can I do for you?";
    } else {
        fulfillmentText = "I heard you, but I don't have a specific action for that yet.";
    }

    // Response format compatible with Dialogflow / Actions on Google
    const response = {
      fulfillmentText: fulfillmentText,
      payload: {
        google: {
          expectUserResponse: true,
          richResponse: {
            items: [
              {
                simpleResponse: {
                  textToSpeech: fulfillmentText
                }
              }
            ]
          }
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error handling Google Assistant request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
