import { logAIEvent } from '@/lib/ai-events';
import { SANDBOX_CONFIG } from './sandbox-config';

type StepFunction<T = any> = (input: any) => Promise<T>;

interface CircuitBreakerConfig {
    failureThreshold: number;
    resetTimeout: number;
}

class CircuitBreaker {
    private failures = 0;
    private lastFailureTime = 0;
    private isOpen = false;

    constructor(private config: CircuitBreakerConfig) { }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.isOpen) {
            if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
                this.isOpen = false;
                this.failures = 0;
            } else {
                throw new Error('Circuit Breaker is OPEN');
            }
        }

        try {
            const result = await fn();
            this.failures = 0;
            return result;
        } catch (error) {
            this.failures++;
            this.lastFailureTime = Date.now();
            if (this.failures >= this.config.failureThreshold) {
                this.isOpen = true;
            }
            throw error;
        }
    }
}

export class AIOrchestrator {
    private circuitBreaker: CircuitBreaker;

    constructor() {
        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 3,
            resetTimeout: 30000, // 30 seconds
        });
    }

    private async withTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
        return Promise.race([
            fn(),
            new Promise<T>((_, reject) =>
                setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
            ),
        ]);
    }

    private async withRetry<T>(fn: () => Promise<T>, retries: number): Promise<T> {
        let lastError: any;
        for (let i = 0; i <= retries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                if (i < retries) {
                    await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i))); // Exponential backoff
                }
            }
        }
        throw lastError;
    }

    async executeStep<T>(
        stepName: string,
        fn: StepFunction<T>,
        input: any,
        workflowId: string,
        itemId?: string
    ): Promise<T> {
        if (SANDBOX_CONFIG.enabled && itemId && SANDBOX_CONFIG.guaranteedOutputs[itemId as keyof typeof SANDBOX_CONFIG.guaranteedOutputs]) {
            // @ts-ignore
            const mockData = SANDBOX_CONFIG.guaranteedOutputs[itemId as keyof typeof SANDBOX_CONFIG.guaranteedOutputs];
            // Simulate step-specific return if needed, for now just return the whole mock object or relevant part
            // In a real scenario, we'd map stepName to specific parts of the mock data
            if (stepName === 'attributes') return mockData.attributes as unknown as T;
            if (stepName === 'description') return mockData.description as unknown as T;
            if (stepName === 'valuation') return mockData.valuation as unknown as T;
            if (stepName === 'provenance') return mockData.provenance as unknown as T;
        }

        await logAIEvent({
            eventType: 'start',
            workflowId,
            stepName,
            itemId,
            metadata: { input },
        });

        try {
            const result = await this.circuitBreaker.execute(() =>
                this.withRetry(() => this.withTimeout(() => fn(input), 10000), 3)
            );

            await logAIEvent({
                eventType: 'success',
                workflowId,
                stepName,
                itemId,
                metadata: { result },
            });

            return result;
        } catch (error: any) {
            await logAIEvent({
                eventType: 'failure',
                workflowId,
                stepName,
                itemId,
                error: error.message,
            });

            // Graceful fallback logic
            if (error.message === 'Circuit Breaker is OPEN' || error.message === 'Operation timed out') {
                await logAIEvent({
                    eventType: 'fallback',
                    workflowId,
                    stepName,
                    itemId,
                    metadata: { reason: error.message }
                });
                throw new Error(`AI Service Unavailable: ${error.message}. Please try manual entry.`);
            }

            throw error;
        }
    }

    async executeChain(itemId: string, image: string) {
        const workflowId = crypto.randomUUID();

        try {
            // Step 1: Attributes
            const attributes = await this.executeStep('attributes', async (img) => {
                // Placeholder for actual AI call
                return { brand: 'Unknown', model: 'Unknown' };
            }, image, workflowId, itemId);

            // Step 2: Description
            const description = await this.executeStep('description', async (attrs) => {
                // Placeholder
                return `A ${attrs.brand} item.`;
            }, attributes, workflowId, itemId);

            // Step 3: Valuation
            const valuation = await this.executeStep('valuation', async (desc) => {
                // Placeholder
                return { value: 100, currency: 'USD' };
            }, description, workflowId, itemId);

            // Step 4: Provenance
            const provenance = await this.executeStep('provenance', async (item) => {
                // Placeholder
                return { history: [] };
            }, { itemId, attributes }, workflowId, itemId);

            return {
                attributes,
                description,
                valuation,
                provenance
            };

        } catch (error) {
            console.error('Chain execution failed:', error);
            throw error;
        }
    }
}

export const orchestrator = new AIOrchestrator();
