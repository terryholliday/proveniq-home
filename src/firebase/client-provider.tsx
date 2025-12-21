'use client';

import React, { useMemo, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { initializeFirebaseAppCheck } from '@/firebase/app-check';
import { connectEmulators } from '@/firebase/emulator-connect';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Connect to emulators if configured (for testing)
  useEffect(() => {
    if (firebaseServices.auth && firebaseServices.firestore) {
      connectEmulators(firebaseServices.auth, firebaseServices.firestore);
    }
  }, [firebaseServices.auth, firebaseServices.firestore]);

  // Initialize App Check after Firebase is ready
  useEffect(() => {
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (recaptchaSiteKey && firebaseServices.firebaseApp) {
      initializeFirebaseAppCheck(firebaseServices.firebaseApp, recaptchaSiteKey);
    }
  }, [firebaseServices.firebaseApp]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}