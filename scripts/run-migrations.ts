import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
// Assumes GOOGLE_APPLICATION_CREDENTIALS is set or running in an environment with default credentials.
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = getFirestore();

async function migrateProvenanceData() {
    console.log('Starting provenance migration...');
    const itemsRef = db.collectionGroup('items');
    const snapshot = await itemsRef.get();

    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    console.log(`Found ${snapshot.size} items.`);

    for (const doc of snapshot.docs) {
        const item = doc.data();
        const itemId = doc.id;

        // Check if provenance already exists and is not empty
        if (item.provenance && item.provenance.length > 0) {
            skippedCount++;
            continue;
        }

        // Create default acquisition event
        const acquisitionEvent = {
            id: crypto.randomUUID(),
            date: item.purchaseDate || item.addedDate || new Date().toISOString(),
            type: 'acquisition',
            description: 'Initial acquisition record created during system migration.',
            cost: item.purchasePrice,
            verified: false, // Default to unverified
        };

        try {
            await doc.ref.update({
                provenance: [acquisitionEvent]
            });
            updatedCount++;
            console.log(`Updated item ${itemId}`);
        } catch (error: unknown) {
            console.error(`Failed to update item ${itemId}:`, error);
            const message = error instanceof Error ? error.message : String(error);
            errors.push(`Item ${itemId}: ${message}`);
        }
    }

    console.log('Migration complete.');
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    if (errors.length > 0) {
        console.log('Errors:', errors);
    }
}

migrateProvenanceData().catch(console.error);
