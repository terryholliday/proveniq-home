'use client';

import { FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck, getToken } from 'firebase/app-check';

let appCheckInstance: AppCheck | null = null;

/**
 * Initialize Firebase App Check with reCAPTCHA v3
 * @param app - Firebase App instance
 * @param siteKey - reCAPTCHA v3 site key from Google Cloud Console
 */
export function initializeFirebaseAppCheck(app: FirebaseApp, siteKey: string): AppCheck | null {
    if (typeof window === 'undefined') {
        // App Check only works in browser environment
        return null;
    }

    if (appCheckInstance) {
        return appCheckInstance;
    }

    try {
        appCheckInstance = initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(siteKey),
            isTokenAutoRefreshEnabled: true, // Automatically refresh tokens
        });
        
        console.log('Firebase App Check initialized successfully');
        return appCheckInstance;
    } catch (error) {
        console.error('Failed to initialize Firebase App Check:', error);
        return null;
    }
}

/**
 * Get the App Check instance
 */
export function getAppCheck(): AppCheck | null {
    return appCheckInstance;
}

/**
 * Fetch App Check token for use with external APIs like Places API
 * This function can be passed to the Places API fetchAppCheckToken setting
 */
export async function fetchAppCheckToken(): Promise<string | null> {
    if (!appCheckInstance) {
        console.warn('App Check not initialized');
        return null;
    }

    try {
        const tokenResult = await getToken(appCheckInstance, /* forceRefresh */ false);
        return tokenResult.token;
    } catch (error) {
        console.error('Failed to get App Check token:', error);
        return null;
    }
}

/**
 * Helper to configure Google Maps/Places API with App Check
 * Use this when initializing the Places API
 */
export function getPlacesApiAppCheckConfig() {
    return {
        fetchAppCheckToken: async () => {
            const token = await fetchAppCheckToken();
            return token || undefined;
        }
    };
}
