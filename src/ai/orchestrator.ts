import { logAIEvent } from '@/lib/ai-events';
import { SANDBOX_CONFIG } from './sandbox-config';
import { AIProcessingResult, AIImageAnalysis, AIMetadata, AIValuation, AIProvenance } from './types';
import { MetadataNormalizer } from './metadata_normalizer';

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
    private normalizer: MetadataNormalizer;

    constructor() {
        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 3,
            resetTimeout: 30000, // 30 seconds
        });
        this.normalizer = new MetadataNormalizer();
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
            // Simulate step-specific return if needed
            if (stepName === 'image_analysis') return mockData.attributes as unknown as T; // Mapping old attributes to image analysis for now
            if (stepName === 'metadata_normalization') return mockData.attributes as unknown as T;
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

    async executeChain(itemId: string, image: string): Promise<AIProcessingResult> {
        const workflowId = crypto.randomUUID();
        const timestamp = new Date().toISOString();

        try {
            // Step 1: Image Analysis (Vision)
            const imageAnalysis = await this.executeStep<AIImageAnalysis>('image_analysis', async (img) => {
                // Placeholder for Vision Intelligence
                return {
                    description: 'Analyzed Image',
                    objects: [],
                    quality: { score: 80, issues: [] }
                };
            }, image, workflowId, itemId);

            // Step 2: Metadata Normalization
            const metadata = await this.executeStep<AIMetadata>('metadata_normalization', async (analysis) => {
                // Use the normalizer
                return this.normalizer.normalize(
                    analysis.description,
                    '', // No extra description yet
                    {}, // No detected attributes yet
                    {}  // No user overrides yet
                );
            }, imageAnalysis, workflowId, itemId);

            // Step 3: Valuation
            const valuation = await this.executeStep<AIValuation>('valuation', async (meta) => {
                // Placeholder for Valuation Engine
                return {
                    estimatedValue: { min: 0, max: 0, currency: 'USD' },
                    confidenceScore: 0,
                    factors: { brand: 0, condition: 0, age: 0, materials: 0, market: 0 },
                    explanation: 'Pending valuation',
                    modelBreakdown: {}
                };
            }, metadata, workflowId, itemId);

            // Step 4: Provenance
            const provenance = await this.executeStep<AIProvenance>('provenance', async (val) => {
                // Placeholder for Provenance Engine
                return {
                    timeline: [],
                    confidenceScore: 0,
                    gapDetected: false,
                    narrative: 'No provenance data'
                };
            }, valuation, workflowId, itemId);

            return {
                itemId,
                workflowId,
                timestamp,
                imageAnalysis,
                metadata,
                valuation,
                provenance,
                status: 'success'
            };

        } catch (error: any) {
            console.error('Chain execution failed:', error);
            return {
                itemId,
                workflowId,
                timestamp,
                metadata: { category: 'Unknown', subcategory: 'Unknown', attributes: {}, confidence: 0, sources: [] },
                valuation: { estimatedValue: { min: 0, max: 0, currency: 'USD' }, confidenceScore: 0, factors: { brand: 0, condition: 0, age: 0, materials: 0, market: 0 }, explanation: 'Error', modelBreakdown: {} },
                provenance: { timeline: [], confidenceScore: 0, gapDetected: false, narrative: 'Error' },
                status: 'failed',
                errors: [error.message]
            };
        }
    }
}

export const orchestrator = new AIOrchestrator();
