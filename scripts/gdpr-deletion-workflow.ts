/**
 * GDPR Right to be Forgotten - User Data Deletion Workflow
 * 
 * This script purges all user data from Firestore collections
 * while maintaining audit trail integrity (tombstone hashing).
 * 
 * Usage:
 *   npx ts-node scripts/gdpr-deletion-workflow.ts --userId=<USER_ID> [--dry-run]
 */

import * as admin from 'firebase-admin';
import { createHash } from 'crypto';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

interface DeletionResult {
    collection: string;
    documentsDeleted: number;
    subCollectionsDeleted: number;
    errors: string[];
}

interface DeletionReport {
    userId: string;
    requestedAt: string;
    completedAt?: string;
    dryRun: boolean;
    results: DeletionResult[];
    tombstoneHash: string;
    success: boolean;
}

/**
 * Generate a tombstone hash for audit trail integrity.
 * The Merkle tree root is updated with this hash instead of the actual data.
 */
function generateTombstoneHash(userId: string, deletedAt: string): string {
    const tombstoneData = `DELETED:${userId}:${deletedAt}`;
    return createHash('sha256').update(tombstoneData).digest('hex');
}

/**
 * Delete all documents in a collection for a specific user.
 */
async function deleteUserCollection(
    collectionPath: string,
    userId: string,
    userIdField: string,
    dryRun: boolean
): Promise<DeletionResult> {
    const result: DeletionResult = {
        collection: collectionPath,
        documentsDeleted: 0,
        subCollectionsDeleted: 0,
        errors: [],
    };

    try {
        const snapshot = await db
            .collection(collectionPath)
            .where(userIdField, '==', userId)
            .get();

        console.log(`  Found ${snapshot.size} documents in ${collectionPath}`);

        for (const doc of snapshot.docs) {
            // Check for subcollections
            const subcollections = await doc.ref.listCollections();
            for (const subcol of subcollections) {
                const subDocs = await subcol.get();
                for (const subDoc of subDocs.docs) {
                    if (!dryRun) {
                        await subDoc.ref.delete();
                    }
                    result.subCollectionsDeleted++;
                }
            }

            // Delete the main document
            if (!dryRun) {
                await doc.ref.delete();
            }
            result.documentsDeleted++;
        }
    } catch (error) {
        result.errors.push(`Error in ${collectionPath}: ${(error as Error).message}`);
    }

    return result;
}

/**
 * Delete user's root document and all subcollections under /users/{userId}
 */
async function deleteUserRoot(userId: string, dryRun: boolean): Promise<DeletionResult> {
    const result: DeletionResult = {
        collection: `users/${userId}`,
        documentsDeleted: 0,
        subCollectionsDeleted: 0,
        errors: [],
    };

    try {
        const userRef = db.doc(`users/${userId}`);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            result.errors.push('User document not found');
            return result;
        }

        // Delete all subcollections (items, auctions, etc.)
        const subcollections = await userRef.listCollections();
        for (const subcol of subcollections) {
            console.log(`  Deleting subcollection: users/${userId}/${subcol.id}`);
            const subDocs = await subcol.get();
            for (const subDoc of subDocs.docs) {
                // Check for nested subcollections (e.g., items/{itemId}/provenance)
                const nestedSubcols = await subDoc.ref.listCollections();
                for (const nestedSubcol of nestedSubcols) {
                    const nestedDocs = await nestedSubcol.get();
                    for (const nestedDoc of nestedDocs.docs) {
                        if (!dryRun) {
                            await nestedDoc.ref.delete();
                        }
                        result.subCollectionsDeleted++;
                    }
                }

                if (!dryRun) {
                    await subDoc.ref.delete();
                }
                result.subCollectionsDeleted++;
            }
        }

        // Delete the user document itself
        if (!dryRun) {
            await userRef.delete();
        }
        result.documentsDeleted++;
    } catch (error) {
        result.errors.push(`Error deleting user root: ${(error as Error).message}`);
    }

    return result;
}

/**
 * Delete user data from Firebase Storage
 */
async function deleteUserStorage(userId: string, dryRun: boolean): Promise<DeletionResult> {
    const result: DeletionResult = {
        collection: 'storage',
        documentsDeleted: 0,
        subCollectionsDeleted: 0,
        errors: [],
    };

    try {
        const bucket = admin.storage().bucket();
        const [files] = await bucket.getFiles({ prefix: `users/${userId}/` });

        console.log(`  Found ${files.length} files in storage`);

        for (const file of files) {
            if (!dryRun) {
                await file.delete();
            }
            result.documentsDeleted++;
        }
    } catch (error) {
        result.errors.push(`Storage deletion error: ${(error as Error).message}`);
    }

    return result;
}

/**
 * Log the deletion request for compliance audit trail
 */
async function logDeletionRequest(report: DeletionReport): Promise<void> {
    await db.collection('deletion_requests').add({
        ...report,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
}

/**
 * Main deletion workflow
 */
async function executeDeleteWorkflow(userId: string, dryRun: boolean): Promise<DeletionReport> {
    const report: DeletionReport = {
        userId,
        requestedAt: new Date().toISOString(),
        dryRun,
        results: [],
        tombstoneHash: '',
        success: false,
    };

    console.log(`\n${'='.repeat(60)}`);
    console.log(`GDPR Deletion Workflow - ${dryRun ? 'DRY RUN' : 'LIVE EXECUTION'}`);
    console.log(`User ID: ${userId}`);
    console.log(`${'='.repeat(60)}\n`);

    // 1. Delete user's root document and subcollections
    console.log('Step 1: Deleting user root document and subcollections...');
    report.results.push(await deleteUserRoot(userId, dryRun));

    // 2. Delete auction bids placed by this user
    console.log('\nStep 2: Deleting auction participation...');
    // Note: Auction bids are stored as subcollections, need collection group query
    const auctionBidsResult: DeletionResult = {
        collection: 'auctions/*/bids',
        documentsDeleted: 0,
        subCollectionsDeleted: 0,
        errors: [],
    };

    try {
        const bidsSnapshot = await db.collectionGroup('bids')
            .where('bidderUid', '==', userId)
            .get();

        console.log(`  Found ${bidsSnapshot.size} bids`);

        for (const doc of bidsSnapshot.docs) {
            if (!dryRun) {
                await doc.ref.delete();
            }
            auctionBidsResult.documentsDeleted++;
        }
    } catch (error) {
        auctionBidsResult.errors.push(`Error: ${(error as Error).message}`);
    }
    report.results.push(auctionBidsResult);

    // 3. Delete auctions created by this user
    console.log('\nStep 3: Deleting user-created auctions...');
    report.results.push(await deleteUserCollection('auctions', userId, 'ownerUid', dryRun));

    // 4. Delete user files from storage
    console.log('\nStep 4: Deleting storage files...');
    report.results.push(await deleteUserStorage(userId, dryRun));

    // 5. Generate tombstone hash for Merkle tree integrity
    report.tombstoneHash = generateTombstoneHash(userId, report.requestedAt);
    console.log(`\nTombstone Hash: ${report.tombstoneHash}`);

    // 6. Log the deletion for audit compliance
    report.completedAt = new Date().toISOString();
    report.success = report.results.every(r => r.errors.length === 0);

    if (!dryRun) {
        console.log('\nStep 5: Logging deletion request...');
        await logDeletionRequest(report);
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('DELETION SUMMARY');
    console.log(`${'='.repeat(60)}`);

    let totalDocs = 0;
    let totalSubcols = 0;
    let totalErrors = 0;

    for (const result of report.results) {
        console.log(`\n${result.collection}:`);
        console.log(`  Documents: ${result.documentsDeleted}`);
        console.log(`  Subcollections: ${result.subCollectionsDeleted}`);
        if (result.errors.length > 0) {
            console.log(`  Errors: ${result.errors.join(', ')}`);
        }
        totalDocs += result.documentsDeleted;
        totalSubcols += result.subCollectionsDeleted;
        totalErrors += result.errors.length;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`TOTAL: ${totalDocs} documents, ${totalSubcols} subcollection docs`);
    console.log(`Status: ${report.success ? '✅ SUCCESS' : '❌ ERRORS OCCURRED'}`);
    if (dryRun) {
        console.log('\n⚠️  DRY RUN - No data was actually deleted');
    }
    console.log(`${'='.repeat(60)}\n`);

    return report;
}

// CLI Execution
async function main() {
    const args = process.argv.slice(2);
    const userIdArg = args.find(a => a.startsWith('--userId='));
    const dryRun = args.includes('--dry-run');

    if (!userIdArg) {
        console.error('Usage: npx ts-node scripts/gdpr-deletion-workflow.ts --userId=<USER_ID> [--dry-run]');
        process.exit(1);
    }

    const userId = userIdArg.split('=')[1];

    if (!userId) {
        console.error('Error: --userId is required');
        process.exit(1);
    }

    try {
        const report = await executeDeleteWorkflow(userId, dryRun);

        if (!report.success) {
            process.exit(1);
        }
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

main();
