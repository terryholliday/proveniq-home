/**
 * seed-legal-docs.ts
 * 
 * Seeds the legal_docs Firestore collection with documents from compliance-seed.ts
 * Usage: npx ts-node scripts/seed-legal-docs.ts
 */
import * as admin from 'firebase-admin';
import { SEED_LEGAL_DOCS } from '../src/lib/compliance-seed';

// Initialize Firebase Admin SDK
// Ensure GOOGLE_APPLICATION_CREDENTIALS is set in environment or use default credentials
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

async function seedLegalDocs() {
    console.log('Starting Legal Documents Seeding...\n');

    const legalDocsRef = db.collection('legal_docs');

    for (const doc of SEED_LEGAL_DOCS) {
        if (!doc.id) {
            console.warn('Skipping document without ID:', doc.title);
            continue;
        }

        try {
            const docRef = legalDocsRef.doc(doc.id);

            // Convert the Timestamp from client SDK to admin SDK
            const docData = {
                ...doc,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            };

            await docRef.set(docData, { merge: true });

            console.log(`✓ Seeded: ${doc.id} - "${doc.title}" (${doc.status})`);
        } catch (error) {
            console.error(`✗ Failed to seed ${doc.id}:`, error);
        }
    }

    console.log('\n✅ Legal Documents Seeding Complete!');
    console.log(`\nSeeded ${SEED_LEGAL_DOCS.length} documents to the 'legal_docs' collection.`);

    // List what was seeded
    console.log('\nSeeded Documents:');
    SEED_LEGAL_DOCS.forEach(doc => {
        console.log(`  - ${doc.id} (${doc.status}): ${doc.title}`);
    });
}

seedLegalDocs()
    .catch((error) => {
        console.error('Error seeding legal documents:', error);
        process.exit(1);
    })
    .finally(() => {
        process.exit(0);
    });
