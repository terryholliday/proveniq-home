'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TenantConfig {
    id: string;
    name: string;
    primaryColor: string;
    logoUrl: string;
    features: {
        valuation: boolean;
        visualTruth: boolean;
        auctions: boolean;
    };
}

const defaultTenant: TenantConfig = {
    id: 'consumer',
    name: 'MyARK',
    primaryColor: '#000000', // Default Black
    logoUrl: '/logo.png',
    features: {
        valuation: true,
        visualTruth: true,
        auctions: true
    }
};

const TenantContext = createContext<TenantConfig>(defaultTenant);

export const useTenant = () => useContext(TenantContext);

export function TenantProvider({ children }: { children: React.ReactNode }) {
    const [tenant, setTenant] = useState<TenantConfig>(defaultTenant);

    useEffect(() => {
        // In a real implementation, we would fetch this from an API
        // based on the subdomain (e.g., statefarm.myark.io)
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

        async function fetchTenantConfig() {
            if (hostname.includes('partner')) {
                // Mock fetching partner config
                setTenant({
                    id: 'partner-demo',
                    name: 'Partner Demo Inc.',
                    primaryColor: '#E02020', // Red
                    logoUrl: '/partner-logo.png',
                    features: {
                        valuation: true,
                        visualTruth: true,
                        auctions: false // Partner disables auctions
                    }
                });

                // Dynamically set CSS variable for Tailwind
                document.documentElement.style.setProperty('--primary', '#E02020');
            }
        }

        fetchTenantConfig();
    }, []);

    return (
        <TenantContext.Provider value={tenant}>
            {children}
        </TenantContext.Provider>
    );
}
