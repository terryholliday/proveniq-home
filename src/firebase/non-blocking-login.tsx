'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  // Assume getAuth and app are initialized elsewhere
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  // This is now blocking because we need to handle the user creation logic in the component
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

// Helper types for WebAuthn
type PublicKeyCredentialCreationOptionsJSON = any; // Simplify for now
type PublicKeyCredentialRequestOptionsJSON = any;

/**
 * Registers a new Passkey for the current user.
 * NOTE: This requires a backend to generate the challenge and verify the response.
 * Since we are "Client-Only" for now, we will simulate the "Local Device" registration 
 * using a purely client-side approach if possible, but WebAuthn strictly requires a server.
 * 
 * BUFFER: If we don't have a backend function for this, we can't do REAL WebAuthn.
 * HOWEVER, Firebase has a "WebAuthn" provider we can use!
 * Let's try to use the Firebase WebAuthnAuthProvider if it exists in the SDK (it should).
 */
import {
  getAuth,
  linkWithPopup,
  signInWithPopup,
  OAuthProvider
} from 'firebase/auth';

export async function registerPasskey(authInstance: Auth, user: any) {
  try {
    console.log("Registering passkey...");

    // DEMO: Trigger actual browser permission prompt if possible
    if (typeof navigator !== 'undefined' && navigator.credentials) {
      // Create a dummy challenge (in real app, comes from server)
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      try {
        await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: {
              name: "MyArk App",
              id: window.location.hostname // Must match current domain
            },
            user: {
              id: new Uint8Array(16), // Dummy ID
              name: user?.email || "user@example.com",
              displayName: user?.displayName || "User"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            timeout: 60000,
            attestation: "none"
          }
        });
        alert("Biometric registration successful! (Saved to device, backend link pending)");
      } catch (err) {
        console.warn("Browser credential creation failed or cancelled:", err);
        alert("Biometric registration cancelled or not supported.");
      }
    } else {
      alert("WebAuthn not supported in this browser.");
    }
  } catch (e) {
    console.error("Error registering passkey:", e);
    throw e;
  }
}

export async function signInWithPasskey(authInstance: Auth) {
  try {
    console.log("Signing in with passkey...");

    if (typeof navigator !== 'undefined' && navigator.credentials) {
      // Create a dummy challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      try {
        await navigator.credentials.get({
          publicKey: {
            challenge,
            timeout: 60000,
            // In real app, we would pass 'allowCredentials' list here
          }
        });
        alert("Biometric sign-in successful! (Demo Only)");
        // Here we would normally call firebase.auth().signInWithCredential(...)
      } catch (err) {
        console.warn("Browser credential get failed or cancelled:", err);
        alert("Biometric sign-in cancelled.");
      }
    } else {
      alert("WebAuthn not supported.");
    }
  } catch (e) {
    console.error("Error signing in with passkey:", e);
    throw e;
  }
}
