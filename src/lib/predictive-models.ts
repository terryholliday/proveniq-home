
export interface UserActivity {
    lastLogin: Date;
    sessionsLast30Days: number;
    itemsAddedLast30Days: number;
    auctionsViewedLast30Days: number;
}

export interface UserBehavior {
    planTier: 'free' | 'premium';
    daysSinceSignup: number;
    featureUsageScore: number;
}

/**
 * Predicts the risk of a user churning based on their activity.
 * Returns a score between 0 (low risk) and 1 (high risk).
 */
export const predictChurnRisk = (activity: UserActivity): number => {
    const daysSinceLogin = (new Date().getTime() - activity.lastLogin.getTime()) / (1000 * 3600 * 24);

    let riskScore = 0;

    // Factor 1: Recency
    if (daysSinceLogin > 30) riskScore += 0.8;
    else if (daysSinceLogin > 14) riskScore += 0.4;
    else riskScore += 0.1;

    // Factor 2: Frequency
    if (activity.sessionsLast30Days < 2) riskScore += 0.2;

    // Factor 3: Engagement
    if (activity.itemsAddedLast30Days === 0 && activity.auctionsViewedLast30Days === 0) riskScore += 0.3;

    return Math.min(riskScore, 1);
};

/**
 * Predicts the probability of a user converting to premium.
 * Returns a score between 0 (low probability) and 1 (high probability).
 */
export const predictConversionProbability = (behavior: UserBehavior): number => {
    if (behavior.planTier === 'premium') return 0; // Already converted

    let probability = 0.1; // Base probability

    // Factor 1: Tenure
    if (behavior.daysSinceSignup > 7 && behavior.daysSinceSignup < 60) probability += 0.3;

    // Factor 2: Feature Usage
    if (behavior.featureUsageScore > 50) probability += 0.4;
    else if (behavior.featureUsageScore > 20) probability += 0.2;

    return Math.min(probability, 1);
};
