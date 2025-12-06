import { collectionGroup, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { InventoryItem, ProvenanceEvent } from '@/lib/types';

export async function migrateProvenanceData() {
    const { firestore } = initializeFirebase();
    const itemsRef = collectionGroup(firestore, 'items');
    const snapshot = await getDocs(itemsRef);

    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const docSnap of snapshot.docs) {
        const item = docSnap.data() as InventoryItem;
        const itemId = docSnap.id;

        // Check if provenance already exists and is not empty
        if (item.provenance && item.provenance.length > 0) {
            skippedCount++;
            continue;
        }

        // Create default acquisition event
        const acquisitionEvent: ProvenanceEvent = {
            id: crypto.randomUUID(),
            date: item.purchaseDate || item.addedDate || new Date().toISOString(),
            type: 'acquisition',
            description: 'Initial acquisition record created during system migration.',
            cost: item.purchasePrice,
            verified: false, // Default to unverified
        };

        try {
            await updateDoc(docSnap.ref, {
                provenance: [acquisitionEvent]
            });
            updatedCount++;
        } catch (error: any) {
            console.error(`Failed to update item ${itemId}:`, error);
            errors.push(`Item ${itemId}: ${error.message}`);
        }
    }

    return { updatedCount, skippedCount, errors };
}
