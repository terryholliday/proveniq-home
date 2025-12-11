'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { // Renamed from UserAuthHookResult for consistency if desired, or keep as UserAuthHookResult
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });

  // Fix Bug 2: Handle Mock User via Effect instead of useMemo to prevent hydration errors
  const [mockUser, setMockUser] = useState<User | null>(null);
  const [mockUserChecked, setMockUserChecked] = useState(false);

  useEffect(() => {
    const windowWithMock = window as Window & { __MOCK_USER__?: User };
    if (typeof window !== 'undefined') {
      if (windowWithMock.__MOCK_USER__) {
        setMockUser(windowWithMock.__MOCK_USER__);
      } else {
        const stored = sessionStorage.getItem('__MOCK_USER__');
        if (stored) {
          try {
            setMockUser(JSON.parse(stored));
          } catch (e) {
            console.error("Failed to parse mock user", e);
          }
        }
      }
    }
    setMockUserChecked(true);
  }, []);

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    console.log('FirebaseProvider: Auth state effect triggered', { mockUser: !!mockUser, auth: !!auth });
    
    // Skip real auth if mock user is active
    if (mockUser) {
      console.log('FirebaseProvider: Using mock user');
      return;
    }

    if (!auth) { // If no Auth service instance, cannot determine user state
      console.error('FirebaseProvider: No auth instance provided');
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not provided.") });
      return;
    }

    console.log('FirebaseProvider: Setting up auth listener');
    setUserAuthState({ user: null, isUserLoading: true, userError: null }); // Reset on auth instance change

    // Safety timeout - if auth doesn't resolve in 3 seconds, stop loading
    const timeoutId = setTimeout(() => {
      console.warn("FirebaseProvider: Auth state check timed out after 3 seconds");
      setUserAuthState(prev => prev.isUserLoading ? { ...prev, isUserLoading: false } : prev);
    }, 3000);

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => { // Auth state determined
        console.log('FirebaseProvider: Auth state resolved', { user: !!firebaseUser });
        clearTimeout(timeoutId);
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => { // Auth listener error
        console.error('FirebaseProvider: Auth state error', error);
        clearTimeout(timeoutId);
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => {
      console.log('FirebaseProvider: Cleaning up auth listener');
      clearTimeout(timeoutId);
      unsubscribe();
    }; // Cleanup
  }, [auth, mockUser]); // Depends on the auth instance and mockUser

  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: mockUser || userAuthState.user,
      isUserLoading: mockUser ? false : (!mockUserChecked || userAuthState.isUserLoading),
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState, mockUser, mockUserChecked]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase<T> = T & { __memo?: boolean };

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- factory/deps are supplied by the caller of this helper.
  const memoized = useMemo(factory, deps);

  if (typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;

  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => { // Renamed from useAuthUser
  const { user, isUserLoading, userError } = useFirebase(); // Leverages the main hook
  return { user, isUserLoading, userError };
};
