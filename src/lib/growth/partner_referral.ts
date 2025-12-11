import { logger } from '../logger';

// Interface for future use when campaign management is implemented
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ReferralCampaign {
    partnerId: string; // e.g. 'statefarm'
    campaignId: string; // e.g. 'spring25'
    discountCode: string; // e.g. 'SF-SPRING-20'
    expiryDate: Date;
}

/**
 * Partner Referral Engine
 * Generates and validates codes for B2B2C growth loops.
 */
export class PartnerReferralEngine {

    /**
     * Generates a canonical referral link for a partner agent to share.
     */
    generateAgentLink(partnerId: string, agentId: string): string {
        const baseUrl = 'https://proveniq.io/start';
        // Format: proveniq.io/start?ref=PROVENIQ-{partnerId}-{agentId}
        return `${baseUrl}?ref=PROVENIQ-${partnerId}-${agentId}`;
    }

    /**
     * Credits a partner for a user signup.
     * In a real app, this would write to a 'referrals' table.
     */
    async trackConversion(referralCode: string, newUserId: string) {
        if (!referralCode.startsWith('PROVENIQ-')) {
            return; // Not a partner referral
        }

        const [, partnerId, agentId] = referralCode.split('-');

        logger.info('Partner Referral Conversion', {
            event: 'PROVENIQ_PARTNER_CONVERSION',
            partnerId,
            agentId,
            newUserId
        });

        // specific business logic: Grant extended free trial
        await this.grantPartnerBenefit(newUserId, partnerId);
    }

    private async grantPartnerBenefit(userId: string, partnerId: string) {
        // Mock DB call
        logger.info(`Granted 3-month Premium to user ${userId} via partner ${partnerId}`);
    }
}
