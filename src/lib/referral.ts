import { createHash } from 'crypto';

/**
 * Generates a short, readable referral code from a user ID.
 * e.g., "MARK-X7B2"
 */
export function generateReferralCode(userId: string, prefix = 'ARK'): string {
    // Determine a hash of the userId to ensure consistency
    // (Ideally specific codes are stored in DB, but this acts as algorithmic fallback)
    const hash = createHash('sha256').update(userId).digest('hex');
    const suffix = hash.substring(0, 4).toUpperCase();
    return `${prefix}-${suffix}`;
}

/**
 * Parses and validates a referral code.
 */
export function parseReferralCode(code: string): { valid: boolean; prefix?: string; suffix?: string } {
    const parts = code.split('-');
    if (parts.length !== 2) {
        return { valid: false };
    }
    return {
        valid: true,
        prefix: parts[0],
        suffix: parts[1]
    };
}

export interface ReferralReward {
    referrerId: string;
    refereeId: string;
    campaignId: string; // e.g., 'beta_launch_2025'
    status: 'pending' | 'converted' | 'paid';
}
