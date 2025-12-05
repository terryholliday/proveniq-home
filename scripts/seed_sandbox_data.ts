import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// Ideally, this should be run with GOOGLE_APPLICATION_CREDENTIALS pointing to the sandbox project service account
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

async function seedSandbox() {
    console.log('Starting Sandbox Data Seeding...');

    // 1. Create a Test User
    const testUserId = 'sandbox-test-user-001';
    const userRef = db.collection('users').doc(testUserId);

    await userRef.set({
        email: 'testuser@sandbox.myark.app',
        displayName: 'Sandbox Tester',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isSandbox: true
    });
    console.log(`Created test user: ${testUserId}`);

    // 2. Create Sample Assets
    const assets = [
        {
            name: 'MacBook Pro 16"',
            category: 'Electronics',
            value: 2500,
            purchaseDate: '2024-01-15',
            serialNumber: 'C02XYZ123ABC'
        },
        {
            name: 'Vintage Guitar',
            category: 'Musical Instruments',
            value: 4500,
            description: '1970 Fender Stratocaster'
        }
    ];

    const assetsRef = userRef.collection('assets');

    for (const asset of assets) {
        await assetsRef.add({
            ...asset,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Added asset: ${asset.name}`);
    }

    // 3. Create Sample Policy (for Insurance Partners to view)
    const policiesRef = userRef.collection('policies');
    await policiesRef.add({
        carrier: 'Lemonade',
        policyNumber: 'POL-99887766',
        type: 'Renters',
        coverageAmount: 50000,
        status: 'Active',
        renewalDate: '2025-12-01'
    });
    console.log('Added sample policy');

    console.log('Sandbox Seeding Complete!');
}

seedSandbox().catch(console.error);
