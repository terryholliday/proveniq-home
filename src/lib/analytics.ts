// Google Analytics 4 Helper

declare global {
    interface Window {
        gtag: (command: string, targetId: string, config?: any) => void;
    }
}

export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with actual ID

export const pageview = (url: string) => {
    if (typeof window.gtag !== 'undefined') {
        window.gtag('config', GA_MEASUREMENT_ID, {
            page_path: url,
        });
    }
};

export const event = ({ action, category, label, value }: {
    action: string;
    category: string;
    label?: string;
    value?: number;
}) => {
    if (typeof window.gtag !== 'undefined') {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};

export const logConsentAccepted = (version: string) => {
    event({
        action: 'consent_accepted',
        category: 'compliance',
        label: version,
    });
};

export const logConsentViewed = (version: string) => {
    event({
        action: 'consent_viewed',
        category: 'compliance',
        label: version,
    });
};

export const logBidPlaced = (auctionId: string, amount: number) => {
    event({
        action: 'bid_placed',
        category: 'auction',
        label: auctionId,
        value: amount,
    });
};


export const logTaxViewed = (auctionId: string) => {
    event({
        action: 'tax_viewed',
        category: 'auction',
        label: auctionId,
    });
};

export const logPlannerStarted = () => {
    event({
        action: 'planner_started',
        category: 'legacy_planner',
    });
};

export const logPlannerStepCompleted = (stepName: string) => {
    event({
        action: 'step_completed',
        category: 'legacy_planner',
        label: stepName,
    });
};

export const logPlannerFinished = () => {
    event({
        action: 'planner_finished',
        category: 'legacy_planner',
    });
};

export const logAuctionListViewed = () => {
    event({
        action: 'auction_list_viewed',
        category: 'auction',
    });
};
