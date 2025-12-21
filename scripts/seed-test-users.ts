/**
 * Test User Seeding Script
 * Creates deterministic test users for E2E testing.
 * 
 * Usage: 
 *   npx tsx scripts/seed-test-users.ts           # Seed to emulator (default)
 *   npx tsx scripts/seed-test-users.ts cleanup   # Remove test users
 * 
 * Requires Firebase Emulator to be running:
 *   firebase emulators:start --only auth,firestore
 */

import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// Use service account for real Firebase
const serviceAccountPath = path.join(__dirname, '..', 'service-account.json');

// Initialize admin SDK with service account
const app = getApps().length ? getApp() : initializeApp({
    credential: cert(serviceAccountPath)
});
const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

interface TestUser {
    email: string;
    password: string;
    displayName: string;
    tenantId: string;
    role: 'user' | 'admin';
}

const TEST_USERS: TestUser[] = [
    {
        email: 'test-user-a@proveniq-test.com',
        password: 'TestPassword123!',
        displayName: 'Test User A',
        tenantId: 'tenant-a',
        role: 'user'
    },
    {
        email: 'test-user-b@proveniq-test.com',
        password: 'TestPassword123!',
        displayName: 'Test User B',
        tenantId: 'tenant-b',
        role: 'user'
    },
    {
        email: 'test-admin@proveniq-test.com',
        password: 'AdminPassword123!',
        displayName: 'Test Admin',
        tenantId: 'system',
        role: 'admin'
    }
];

async function seedTestUsers() {
    console.log('🌱 Seeding test users...\n');

    for (const testUser of TEST_USERS) {
        try {
            // Check if user already exists
            let uid: string;
            try {
                const existingUser = await adminAuth.getUserByEmail(testUser.email);
                uid = existingUser.uid;
                console.log(`✓ User ${testUser.email} already exists (uid: ${uid})`);
            } catch {
                // User doesn't exist, create them
                const newUser = await adminAuth.createUser({
                    email: testUser.email,
                    password: testUser.password,
                    displayName: testUser.displayName,
                    emailVerified: true // Skip email verification for test users
                });
                uid = newUser.uid;
                console.log(`✓ Created user ${testUser.email} (uid: ${uid})`);
            }

            // Set custom claims for tenancy and role
            const customClaims: Record<string, unknown> = {
                tenantId: testUser.tenantId
            };
            if (testUser.role === 'admin') {
                customClaims.admin = true;
            }
            await adminAuth.setCustomUserClaims(uid, customClaims);
            console.log(`  → Set claims: tenantId=${testUser.tenantId}, admin=${testUser.role === 'admin'}`);

            // Create/update user document in Firestore
            await adminDb.collection('users').doc(uid).set({
                uid,
                email: testUser.email,
                displayName: testUser.displayName,
                tenantId: testUser.tenantId,
                role: testUser.role,
                createdAt: new Date(),
                isTestUser: true
            }, { merge: true });
            console.log(`  → Synced Firestore user document\n`);

        } catch (error) {
            console.error(`✗ Failed to seed ${testUser.email}:`, error);
        }
    }

    console.log('✅ Test user seeding complete!\n');
    console.log('Test credentials for E2E:');
    console.log('─'.repeat(50));
    TEST_USERS.forEach(u => {
        console.log(`  ${u.displayName}`);
        console.log(`    Email: ${u.email}`);
        console.log(`    Password: ${u.password}`);
        console.log(`    Tenant: ${u.tenantId}`);
        console.log('');
    });
}

async function cleanupTestUsers() {
    console.log('🧹 Cleaning up test users...\n');

    for (const testUser of TEST_USERS) {
        try {
            const existingUser = await adminAuth.getUserByEmail(testUser.email);
            await adminAuth.deleteUser(existingUser.uid);
            await adminDb.collection('users').doc(existingUser.uid).delete();
            console.log(`✓ Deleted ${testUser.email}`);
        } catch {
            console.log(`  (${testUser.email} not found, skipping)`);
        }
    }

    console.log('\n✅ Cleanup complete!');
}

// Export for use in tests
export { TEST_USERS, seedTestUsers, cleanupTestUsers };

// CLI execution
const command = process.argv[2];
if (command === 'cleanup') {
    cleanupTestUsers().catch(console.error);
} else {
    seedTestUsers().catch(console.error);
}
