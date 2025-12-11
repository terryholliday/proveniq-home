/**
 * Proveniq Home Analytics Schema
 * Defines the contract for all telemetry and tracking within the application.
 */

export type EventName =
    | 'page_view'
    | 'signup_completed'
    | 'item_added'
    | 'valuation_generated'
    | 'visual_truth_verified'
    | 'referral_share'
    | 'export_report';

export interface BaseEventProperties {
    timestamp: number;
    sessionId: string;
    path: string;
}

export interface ItemAddedProperties extends BaseEventProperties {
    category: string;
    hasPhotos: boolean;
    isManualEntry: boolean;
}

export interface ValuationGeneratedProperties extends BaseEventProperties {
    itemId: string;
    value: number;
    confidenceScore: number;
    modelUsed: 'heuristic' | 'llm' | 'hybrid';
}

export interface VisualTruthVerifiedProperties extends BaseEventProperties {
    itemId: string;
    isSuccess: boolean;
    tamperingDetected?: boolean;
}

export interface TrackingSchema {
    eventName: EventName;
    properties: Record<string, unknown>;
    userId?: string;
    userProperties?: {
        planTier: 'free' | 'pro' | 'enterprise';
        totalItems: number;
        totalValue: number;
    };
}

/**
 * Validation helper (runtime)
 */
export function validateEvent(event: TrackingSchema): boolean {
    if (!event.eventName) return false;
    // Add runtime validation logic here if needed (e.g. Zod)
    return true;
}
