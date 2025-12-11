import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

export interface RateLimitResult {
    allowed: boolean;
    retryAfterMs?: number;
    remaining?: number;
}

export interface RateLimiterConfig {
    maxRequests: number;      // Max requests in window
    windowMs: number;         // Window size in milliseconds
    burstAllowance?: number;  // Extra burst capacity
}

/**
 * Abstract rate limiter interface.
 * MVP uses Firestore, can be swapped for Redis later.
 */
export interface RateLimiter {
    checkLimit(key: string): Promise<RateLimitResult>;
}

// --- MVP Implementation: Firestore-based ---

const BID_RATE_LIMIT_COLLECTION = "rate_limits";

/**
 * Firestore-based rate limiter using token bucket algorithm.
 * Stores last request timestamp per key.
 * 
 * Trade-offs:
 * - Pros: No extra infra, simple
 * - Cons: ~50ms latency, potential contention at scale
 * 
 * Migration path: Replace with RedisRateLimiter when scaling.
 */
export class FirestoreRateLimiter implements RateLimiter {
    private config: RateLimiterConfig;

    constructor(config: RateLimiterConfig) {
        this.config = config;
    }

    async checkLimit(key: string): Promise<RateLimitResult> {
        const docRef = db.collection(BID_RATE_LIMIT_COLLECTION).doc(key);
        const now = Date.now();
        const windowStart = now - this.config.windowMs;

        try {
            const result = await db.runTransaction(async (tx) => {
                const doc = await tx.get(docRef);
                const data = doc.data() as { timestamps: number[] } | undefined;

                // Filter timestamps within the current window
                const timestamps = data?.timestamps?.filter((t: number) => t > windowStart) || [];

                const maxAllowed = this.config.maxRequests + (this.config.burstAllowance || 0);

                if (timestamps.length >= maxAllowed) {
                    // Rate limited
                    const oldestInWindow = Math.min(...timestamps);
                    const retryAfterMs = oldestInWindow + this.config.windowMs - now;
                    return {
                        allowed: false,
                        retryAfterMs: Math.max(0, retryAfterMs),
                        remaining: 0,
                    };
                }

                // Add current timestamp
                timestamps.push(now);
                tx.set(docRef, { timestamps, updatedAt: now }, { merge: true });

                return {
                    allowed: true,
                    remaining: maxAllowed - timestamps.length,
                };
            });

            return result;
        } catch (error) {
            console.error("Rate limit check failed:", error);
            // Fail open to avoid blocking legitimate users on errors
            return { allowed: true, remaining: 0 };
        }
    }
}

// --- Future: Redis Implementation (placeholder) ---

/**
 * Redis-based rate limiter using token bucket.
 * TODO: Implement when scaling requires <5ms latency.
 * 
 * Example with Memorystore:
 * - Use MULTI/EXEC for atomic operations
 * - ZADD for sliding window log
 * - ZREMRANGEBYSCORE to clean old entries
 */
export class RedisRateLimiter implements RateLimiter {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_config: RateLimiterConfig) {
        throw new Error("RedisRateLimiter not implemented. Use FirestoreRateLimiter for MVP.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async checkLimit(_key: string): Promise<RateLimitResult> {
        throw new Error("Not implemented");
    }
}

// --- Factory ---

export function createBidRateLimiter(): RateLimiter {
    // MVP: Use Firestore
    // TODO: Switch to Redis when RATE_LIMITER_BACKEND=redis
    return new FirestoreRateLimiter({
        maxRequests: 1,       // 1 bid per second
        windowMs: 1000,       // 1 second window
        burstAllowance: 2,    // Allow burst of 3 rapid bids
    });
}
