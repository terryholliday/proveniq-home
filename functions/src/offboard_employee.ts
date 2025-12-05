import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const db = getFirestore();
const auth = getAuth();

interface OffboardEmployeeInput {
    targetUid: string;
    reason: string;
    immediateDelete?: boolean;
}

/**
 * Offboard Employee/User
 * - Disables Firebase Auth account
 * - Marks user profile as 'offboarded'
 * - Optionally schedules data deletion (or deletes immediately if critical)
 * - Admin only (TODO: Add admin check)
 */
export const offboardEmployee = onCall<OffboardEmployeeInput>(
    { enforceAppCheck: true, consumeAppCheckToken: true },
    async (request) => {
        // 1. Auth Check
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Authentication required.");
        }

        // Admin Role Check
        if (request.auth.token.admin !== true) {
            throw new HttpsError("permission-denied", "Admin only.");
        }

        const { targetUid, reason, immediateDelete } = request.data;

        if (!targetUid || typeof targetUid !== "string") {
            throw new HttpsError("invalid-argument", "targetUid is required.");
        }

        try {
            // 2. Disable Auth
            await auth.updateUser(targetUid, {
                disabled: true,
            });
            console.log(`Disabled auth for user ${targetUid}`);

            // 3. Revoke Refresh Tokens
            await auth.revokeRefreshTokens(targetUid);
            console.log(`Revoked tokens for user ${targetUid}`);

            // 4. Update User Profile
            const userRef = db.collection("users").doc(targetUid);
            await userRef.update({
                "offboarding.status": "offboarded",
                "offboarding.reason": reason,
                "offboarding.at": admin.firestore.Timestamp.now(),
                "offboarding.by": request.auth.uid,
                isActive: false,
            });

            // 5. Handle Data Deletion
            if (immediateDelete) {
                // WARNING: Destructive!
                await db.recursiveDelete(userRef);
                console.log(`Recursively deleted data for user ${targetUid}`);
                return { success: true, message: "User offboarded and data deleted." };
            } else {
                // Schedule for 30-day retention (soft delete)
                // In a real system, we'd add a 'scheduledForDeletionAt' field and have a cron job pick it up.
                await userRef.update({
                    scheduledForDeletionAt: admin.firestore.Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000)
                });
                return { success: true, message: "User offboarded. Data scheduled for deletion in 30 days." };
            }

        } catch (error) {
            console.error("Offboarding failed:", error);
            throw new HttpsError("internal", "Failed to offboard user.", error);
        }
    }
);
