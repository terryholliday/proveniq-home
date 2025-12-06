import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

const db = getFirestore();
const storage = getStorage();

interface RTBFRequest {
    confirmDeletion: boolean;
    reason?: string;
}

interface DeletionResult {
    collection: string;
    deletedCount: number;
    errors: string[];
}

/**
 * Right to Be Forgotten (RTBF) - GDPR Article 17 / CCPA Compliance
 * 
 * This function handles complete user data deletion requests.
 * 
 * IMPORTANT: This is a destructive, irreversible operation.
 * 
 * What gets deleted:
 * - User profile document
 * - All inventory items
 * - All auction listings (owned)
 * - All bids placed
 * - All uploaded images
 * - Rate limit records
 * 
 * What is RETAINED (legal requirement):
 * - Audit logs (anonymized)
 * - Provenance hashes (item integrity, not PII)
 * - Tax records (7-year retention per IRS)
 */
export const rightToBeForgotten = onCall(
    {
        enforceAppCheck: true,
        consumeAppCheckToken: true,
        // Increase timeout for large deletions
        timeoutSeconds: 300,
    },
    async (request) => {
        // 1. Authentication check
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Authentication required.");
        }

        const uid = request.auth.uid;
        const email = request.auth.token.email || "unknown";
        const data = request.data as RTBFRequest;

        // 2. Require explicit confirmation
        if (!data.confirmDeletion) {
            throw new HttpsError(
                "failed-precondition",
                "You must set confirmDeletion: true to proceed."
            );
        }

        logger.warn("RTBF request initiated", { uid, email, reason: data.reason });

        const results: DeletionResult[] = [];
        const batch = db.batch();

        try {
            // 3. Delete user profile
            const userRef = db.collection("users").doc(uid);
            batch.delete(userRef);
            results.push({ collection: "users", deletedCount: 1, errors: [] });

            // 4. Delete inventory items
            const itemsResult = await deleteSubcollection(`users/${uid}/items`);
            results.push({ collection: "users/{uid}/items", ...itemsResult });

            // 5. Delete auctions owned by user
            const auctionsResult = await deleteCollectionWhere("auctions", "ownerUid", uid);
            results.push({ collection: "auctions", ...auctionsResult });

            // 6. Delete bids placed by user (across all auctions)
            const bidsResult = await deleteBidsByUser(uid);
            results.push({ collection: "bids", ...bidsResult });

            // 7. Delete rate limit records
            const rateLimitResult = await deleteCollectionWhere("rate_limits", "__name__", `bid:user:${uid}`);
            results.push({ collection: "rate_limits", ...rateLimitResult });

            // 8. Delete uploaded files from Storage
            const storageResult = await deleteUserStorage(uid);
            results.push({ collection: "storage", ...storageResult });

            // 9. Anonymize audit logs (keep for compliance, remove PII)
            const auditResult = await anonymizeAuditLogs(uid);
            results.push({ collection: "audit_logs (anonymized)", ...auditResult });

            // 10. Commit batch
            await batch.commit();

            // 11. Log deletion event (anonymized)
            await db.collection("deletion_requests").add({
                requestedAt: FieldValue.serverTimestamp(),
                reason: data.reason || "Not provided",
                collections: results.map(r => r.collection),
                totalDeleted: results.reduce((sum, r) => sum + r.deletedCount, 0),
                // Do NOT log email/uid here
            });

            logger.warn("RTBF completed", { uid: "[REDACTED]", results });

            return {
                success: true,
                message: "Your data has been deleted. This action is irreversible.",
                summary: results,
            };

        } catch (error) {
            logger.error("RTBF failed", { uid, error });
            throw new HttpsError(
                "internal",
                "Deletion failed. Please contact support."
            );
        }
    }
);

// --- Helper Functions ---

async function deleteSubcollection(path: string): Promise<{ deletedCount: number; errors: string[] }> {
    const snapshot = await db.collection(path).get();
    const batch = db.batch();
    let count = 0;

    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        count++;
    });

    await batch.commit();
    return { deletedCount: count, errors: [] };
}

async function deleteCollectionWhere(
    collectionPath: string,
    field: string,
    value: string
): Promise<{ deletedCount: number; errors: string[] }> {
    const snapshot = await db.collection(collectionPath)
        .where(field, "==", value)
        .get();

    const batch = db.batch();
    let count = 0;

    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        count++;
    });

    await batch.commit();
    return { deletedCount: count, errors: [] };
}

async function deleteBidsByUser(uid: string): Promise<{ deletedCount: number; errors: string[] }> {
    // Bids are stored as subcollections under auctions
    const auctionsSnapshot = await db.collection("auctions").get();
    let totalDeleted = 0;
    const errors: string[] = [];

    for (const auctionDoc of auctionsSnapshot.docs) {
        try {
            const bidsSnapshot = await auctionDoc.ref
                .collection("bids")
                .where("bidderUid", "==", uid)
                .get();

            const batch = db.batch();
            bidsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
                totalDeleted++;
            });
            await batch.commit();
        } catch (e) {
            errors.push(`Failed to delete bids from auction ${auctionDoc.id}`);
        }
    }

    return { deletedCount: totalDeleted, errors };
}

async function deleteUserStorage(uid: string): Promise<{ deletedCount: number; errors: string[] }> {
    try {
        const bucket = storage.bucket();
        const [files] = await bucket.getFiles({ prefix: `users/${uid}/` });

        let count = 0;
        for (const file of files) {
            await file.delete();
            count++;
        }

        return { deletedCount: count, errors: [] };
    } catch (e) {
        return { deletedCount: 0, errors: [`Storage deletion failed: ${e}`] };
    }
}

async function anonymizeAuditLogs(uid: string): Promise<{ deletedCount: number; errors: string[] }> {
    // Instead of deleting, we anonymize to maintain audit trail integrity
    const snapshot = await db.collection("audit_logs")
        .where("userId", "==", uid)
        .get();

    const batch = db.batch();
    let count = 0;

    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
            userId: "[DELETED_USER]",
            userEmail: null,
            anonymizedAt: FieldValue.serverTimestamp(),
        });
        count++;
    });

    await batch.commit();
    return { deletedCount: count, errors: [] };
}
