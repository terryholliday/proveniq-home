/**
 * Firebase Emulator Configuration
 * 
 * Connects Firebase SDKs to local emulators for testing.
 * This file should be imported BEFORE any Firebase operations in test environments.
 */

import { connectAuthEmulator, Auth } from 'firebase/auth';
import { connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { connectStorageEmulator, FirebaseStorage } from 'firebase/storage';

const EMULATOR_CONFIG = {
    auth: {
        host: 'localhost',
        port: 9099,
    },
    firestore: {
        host: 'localhost',
        port: 8080,
    },
    storage: {
        host: 'localhost',
        port: 9199,
    },
};

let emulatorsConnected = false;

/**
 * Connect Firebase client SDKs to local emulators.
 * Safe to call multiple times - will only connect once.
 */
export function connectToEmulators(
    auth: Auth,
    firestore: Firestore,
    storage?: FirebaseStorage
): void {
    if (emulatorsConnected) {
        console.log('[Emulator] Already connected to emulators');
        return;
    }

    try {
        // Connect Auth Emulator
        connectAuthEmulator(auth, `http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}`, {
            disableWarnings: true,
        });
        console.log(`[Emulator] Auth connected to ${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}`);

        // Connect Firestore Emulator
        connectFirestoreEmulator(
            firestore,
            EMULATOR_CONFIG.firestore.host,
            EMULATOR_CONFIG.firestore.port
        );
        console.log(`[Emulator] Firestore connected to ${EMULATOR_CONFIG.firestore.host}:${EMULATOR_CONFIG.firestore.port}`);

        // Connect Storage Emulator (optional)
        if (storage) {
            connectStorageEmulator(
                storage,
                EMULATOR_CONFIG.storage.host,
                EMULATOR_CONFIG.storage.port
            );
            console.log(`[Emulator] Storage connected to ${EMULATOR_CONFIG.storage.host}:${EMULATOR_CONFIG.storage.port}`);
        }

        emulatorsConnected = true;
    } catch (error) {
        console.error('[Emulator] Failed to connect:', error);
        throw error;
    }
}

/**
 * Check if we should use emulators based on environment.
 */
export function shouldUseEmulators(): boolean {
    return (
        process.env.NEXT_PUBLIC_USE_EMULATORS === 'true' ||
        process.env.USE_FIREBASE_EMULATORS === 'true' ||
        process.env.NODE_ENV === 'test'
    );
}

/**
 * Get emulator host URLs for direct HTTP access (e.g., REST API calls).
 */
export function getEmulatorUrls() {
    return {
        auth: `http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}`,
        firestore: `http://${EMULATOR_CONFIG.firestore.host}:${EMULATOR_CONFIG.firestore.port}`,
        storage: `http://${EMULATOR_CONFIG.storage.host}:${EMULATOR_CONFIG.storage.port}`,
    };
}

export { EMULATOR_CONFIG };
