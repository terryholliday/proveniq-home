/**
 * E2E Test Emulator Setup
 * 
 * Configures Playwright tests to work with Firebase Emulator.
 * Import this in tests that need emulator connectivity.
 */

import { Page } from '@playwright/test';

export const EMULATOR_CONFIG = {
    auth: {
        host: 'localhost',
        port: 9099,
    },
    firestore: {
        host: 'localhost',
        port: 8080,
    },
    projectId: 'demo-proveniq-test',
};

/**
 * Inject emulator configuration into the browser context.
 * Call this before navigating to any page that uses Firebase.
 */
export async function setupEmulatorInBrowser(page: Page): Promise<void> {
    await page.addInitScript(`
        // Configure Firebase to use emulators
        window.__FIREBASE_EMULATOR_CONFIG__ = {
            auth: {
                host: '${EMULATOR_CONFIG.auth.host}',
                port: ${EMULATOR_CONFIG.auth.port},
            },
            firestore: {
                host: '${EMULATOR_CONFIG.firestore.host}',
                port: ${EMULATOR_CONFIG.firestore.port},
            },
            projectId: '${EMULATOR_CONFIG.projectId}',
        };
        
        // Set environment flag
        window.__USE_FIREBASE_EMULATORS__ = true;
    `);
}

/**
 * Create a test user directly via the Auth Emulator REST API.
 * This bypasses the UI for faster test setup.
 */
export async function createEmulatorUser(
    email: string,
    password: string,
    displayName?: string
): Promise<{ localId: string; idToken: string }> {
    const signUpUrl = `http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`;

    const response = await fetch(signUpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
            displayName: displayName || email.split('@')[0],
            returnSecureToken: true,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create emulator user: ${error}`);
    }

    return response.json();
}

/**
 * Sign in a user via the Auth Emulator REST API.
 * Returns an ID token that can be used for authenticated requests.
 */
export async function signInEmulatorUser(
    email: string,
    password: string
): Promise<{ localId: string; idToken: string }> {
    const signInUrl = `http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`;

    const response = await fetch(signInUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to sign in emulator user: ${error}`);
    }

    return response.json();
}

/**
 * Clear all Auth Emulator users.
 * Useful for test cleanup.
 */
export async function clearEmulatorAuth(): Promise<void> {
    const clearUrl = `http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}/emulator/v1/projects/${EMULATOR_CONFIG.projectId}/accounts`;

    const response = await fetch(clearUrl, { method: 'DELETE' });

    if (!response.ok) {
        console.warn('Failed to clear auth emulator:', await response.text());
    }
}

/**
 * Clear all Firestore Emulator data.
 * Useful for test cleanup.
 */
export async function clearEmulatorFirestore(): Promise<void> {
    const clearUrl = `http://${EMULATOR_CONFIG.firestore.host}:${EMULATOR_CONFIG.firestore.port}/emulator/v1/projects/${EMULATOR_CONFIG.projectId}/databases/(default)/documents`;

    const response = await fetch(clearUrl, { method: 'DELETE' });

    if (!response.ok) {
        console.warn('Failed to clear firestore emulator:', await response.text());
    }
}

/**
 * Check if emulators are running.
 */
export async function areEmulatorsRunning(): Promise<boolean> {
    try {
        const response = await fetch(
            `http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}/`,
            { method: 'GET' }
        );
        return response.ok;
    } catch {
        return false;
    }
}
