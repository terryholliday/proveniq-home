'use server';
/**
 * @fileOverview Evaluates a sales representative's response to a customer scenario.
 *
 * - evaluateSalesResponse - A function that provides a score and feedback on a sales response.
 * - EvaluateSalesResponseInput - The input type for the evaluateSalesResponse function.
 * - EvaluateSalesResponseOutput - The return type for the evaluateSalesResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EvaluateSalesResponseInputSchema = z.object({
  scenario: z.string().describe('The customer objection or scenario presented to the sales representative.'),
  response: z.string().describe("The sales representative's response to the scenario."),
});
export type EvaluateSalesResponseInput = z.infer<typeof EvaluateSalesResponseInputSchema>;

const EvaluateSalesResponseOutputSchema = z.object({
  score: z.number().min(1).max(10).describe('A score from 1 to 10 evaluating the effectiveness of the response.'),
  feedback: z.string().describe('Concise, actionable feedback for the sales representative, focusing on empathy, clarity, and mentioning key product features.'),
});
export type EvaluateSalesResponseOutput = z.infer<typeof EvaluateSalesResponseOutputSchema>;

export async function evaluateSalesResponse(input: EvaluateSalesResponseInput): Promise<EvaluateSalesResponseOutput> {
  return evaluateSalesResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateSalesResponsePrompt',
  input: { schema: EvaluateSalesResponseInputSchema },
  output: { schema: EvaluateSalesResponseOutputSchema },
  prompt: `You are a sales enablement coach for PROVENIQ Home, a home inventory application. Your task is to evaluate a sales representative's response to a customer objection.

Rate the response on a scale of 1 to 10 and provide concise, constructive feedback. Your feedback should focus on:
1.  **Empathy:** Did the rep acknowledge the customer's point of view?
2.  **Clarity:** Was the response easy to understand?
3.  **Value Proposition:** Did the rep effectively communicate PROVENIQ Home's unique value and features to counter the objection?

**Customer Scenario:**
"{{{scenario}}}"

**Sales Rep's Response:**
"{{{response}}}"

Provide your evaluation in the requested JSON format.
`,
});

const evaluateSalesResponseFlow = ai.defineFlow(
  {
    name: 'evaluateSalesResponseFlow',
    inputSchema: EvaluateSalesResponseInputSchema,
    outputSchema: EvaluateSalesResponseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
