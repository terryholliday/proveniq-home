'use server';
/**
 * @fileOverview AI stability utilities for handling timeouts, retries, and graceful failures.
 */

const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 30000);
const AI_MAX_RETRIES = Number(process.env.AI_MAX_RETRIES || 2);
const AI_RETRY_DELAY_MS = Number(process.env.AI_RETRY_DELAY_MS || 1000);

export type AIResult<T> =
    | { success: true; data: T; latencyMs: number }
    | { success: false; error: string; latencyMs: number };

/**
 * Wraps an AI call with timeout, retry logic, and structured result.
 */
export async function withAIStability<T>(
    fn: () => Promise<T>,
    options?: {
        timeout?: number;
        maxRetries?: number;
        retryDelay?: number;
        operationName?: string;
    }
): Promise<AIResult<T>> {
    const timeout = options?.timeout ?? AI_TIMEOUT_MS;
    const maxRetries = options?.maxRetries ?? AI_MAX_RETRIES;
    const retryDelay = options?.retryDelay ?? AI_RETRY_DELAY_MS;
    const opName = options?.operationName ?? 'ai_call';

    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await Promise.race([
                fn(),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('AI operation timed out')), timeout)
                ),
            ]);

            const latencyMs = Date.now() - startTime;
            logAIOutcome(opName, true, latencyMs, attempt);

            return { success: true, data: result, latencyMs };
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));

            // Don't retry on timeout
            if (lastError.message === 'AI operation timed out') {
                break;
            }

            // Wait before retry (unless last attempt)
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
            }
        }
    }

    const latencyMs = Date.now() - startTime;
    const errorMessage = lastError?.message || 'Unknown AI error';
    logAIOutcome(opName, false, latencyMs, AI_MAX_RETRIES, errorMessage);

    return { success: false, error: errorMessage, latencyMs };
}

/**
 * Logs AI call outcomes in structured format.
 * Does NOT log sensitive data (prompts, outputs).
 */
function logAIOutcome(
    operation: string,
    success: boolean,
    latencyMs: number,
    attempts: number,
    errorMessage?: string
) {
    const logData = {
        event: 'ai_operation',
        operation,
        success,
        latencyMs,
        attempts,
        ...(errorMessage && { error: errorMessage }),
    };

    if (success) {
        console.info(JSON.stringify(logData));
    } else {
        console.error(JSON.stringify(logData));
    }
}

/**
 * Helper to provide user-friendly error messages for AI failures.
 */
export function getAIFallbackMessage(operationType: string): string {
    const messages: Record<string, string> = {
        auction_details: 'Could not generate auction details automatically. Please enter them manually.',
        sales_ad: 'Could not generate a sales description. Please write your own.',
        room_audit: 'Could not analyze the room. Please review items manually.',
        search: 'Search could not be completed. Please try a different query.',
        valuation: 'Could not estimate value. Please enter an estimated value.',
        default: 'AI assistance is temporarily unavailable. Please try again or proceed manually.',
    };

    return messages[operationType] || messages.default;
}
