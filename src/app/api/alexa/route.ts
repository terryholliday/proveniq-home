import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { request, session } = body;

    console.log("Alexa Request:", JSON.stringify(body, null, 2));

    let responseText = "Welcome to My Ark. How can I help you today?";

    if (request.type === 'IntentRequest') {
      const intentName = request.intent.name;

      if (intentName === 'AMAZON.HelpIntent') {
        responseText = "You can ask me about your inventory, tasks, or upcoming events.";
      } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        responseText = "Goodbye!";
      } else {
        // Handle custom intents here
        responseText = "I'm not sure how to help with that yet.";
      }
    }

    const response = {
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: responseText,
        },
        shouldEndSession: request.type === 'SessionEndedRequest' || request.intent?.name === 'AMAZON.StopIntent'
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error handling Alexa request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
