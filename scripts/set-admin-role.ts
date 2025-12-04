/**
 * set-admin-role.ts
 * 
 * Helper script to set custom claims for SOC 2 RBAC.
 * Usage: npx ts-node set-admin-role.ts <email>
 */
import * as admin from 'firebase-admin';

// Initialize with service account credentials
// Ensure GOOGLE_APPLICATION_CREDENTIALS is set in environment
if (!admin.apps.length) {
  admin.initializeApp();
}

async function setAdminRole(email: string) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    
    // Set 'admin' custom claim
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
      verifier: false, // Explicitly set others to false for clarity
    });

    console.log(`Success! User ${email} (UID: ${user.uid}) is now an Admin.`);
    console.log('User must sign out and sign back in for changes to take effect.');
  } catch (error) {
    console.error('Error setting admin role:', error);
    process.exit(1);
  }
}

const targetEmail = process.argv[2];
if (!targetEmail) {
  console.log('Usage: npx ts-node set-admin-role.ts <email>');
  process.exit(1);
}

setAdminRole(targetEmail);
