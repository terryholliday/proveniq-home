/**
 * Firebase Emulator Connection for Client-Side
 * 
 * This module connects the Firebase client SDK to local emulators
 * when running in test/development mode.
 */

'use client';

import { Auth, connectAuthEmulator } from 'firebase/auth';
import { Firestore, connectFirestoreEmulator } from 'firebase/firestore';

const EMULATOR_CONFIG = {
    auth: { host: 'localhost', port: 9099 },
    firestore: { host: 'localhost', port: 8080 },
};

let connected = false;

/**
 * Connect to Firebase Emulators.
 * Safe to call multiple times - only connects once.
 */
export function connectEmulators(auth: Auth, firestore: Firestore): void {
    if (connected) return;
    
    // Check if we should use emulators
    const useEmulators = 
        typeof window !== 'undefined' && 
        ((window as unknown as { __USE_FIREBASE_EMULATORS__?: boolean }).__USE_FIREBASE_EMULATORS__ === true ||
         process.env.NEXT_PUBLIC_USE_EMULATORS === 'true');
    
    if (!useEmulators) return;

    try {
        connectAuthEmulator(auth, `http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}`, {
            disableWarnings: true,
        });
        
        connectFirestoreEmulator(
            firestore,
            EMULATOR_CONFIG.firestore.host,
            EMULATOR_CONFIG.firestore.port
        );
        
        connected = true;
        console.log('[Firebase] Connected to emulators');
    } catch (error) {
        console.warn('[Firebase] Emulator connection failed:', error);
    }
}

/**
 * Check if emulators should be used based on environment/window flags.
 */
export function shouldUseEmulators(): boolean {
    if (typeof window === 'undefined') return false;
    
    return (
        (window as unknown as { __USE_FIREBASE_EMULATORS__?: boolean }).__USE_FIREBASE_EMULATORS__ === true ||
        process.env.NEXT_PUBLIC_USE_EMULATORS === 'true'
    );
}
