import * as logger from "firebase-functions/logger";
import {onDocumentWritten} from "firebase-functions/v2/firestore";
import {getFirestore} from "firebase-admin/firestore";

const db = getFirestore();

/**
 * Audit Bid Transactions
 *
 * Purpose: SOC 2 Compliance - Tracking Change Management
 * Trigger: Any write (Create, Update, Delete) to the bids collection
 * Action: Writes an immutable record to 'audit_logs'
 */
export const auditBidWrites = onDocumentWritten(
  "auctions/{auctionId}/bids/{bidId}",
  async (event: any) => {
    // 1. Extract Data
    // v2 events can have undefined data, so handle that safely
    const data = event.data;
    if (!data) return; // Should not happen for valid writes

    const before = data.before?.data() ?? null;
    const after = data.after?.data() ?? null;

    // 2. Determine Operation Type
    let operationType = "UNKNOWN";
    if (!before && after) {
      operationType = "CREATE";
    } else if (before && after) {
      operationType = "UPDATE";
    } else if (before && !after) {
      operationType = "DELETE";
    }

    // 3. Identify Actor (User)
    // - Best effort via auth context if available
    // - Fallback to payload data or 'system'
    // Safe access because we checked 'data' above
    const userId = event.data?.after.data()?.bidderId ?? "system";
    // Note: 'event.auth' is not always available in Firestore triggers
    // Using data payload is a reliable fallback for app-level attribution

    // 4. Construct Immutable Log Entry
    const auditEntry = {
      domain: "auctions", // Added domain field
      collectionPath: event.document, // e.g. "auctions/123/bids/456"
      timestamp: new Date().toISOString(),
      operationType,
      userId,
      before, // Capture full state before
      after, // Capture full state after
      // Metadata
      eventId: event.id,
      resource: event.source,
    };

    // 5. Write to Immutable Log Collection
    // Security Rule ensures this collection is read-only for clients
    try {
      await db.collection("audit_logs").add(auditEntry);
      logger.info(
        `Audit log written for ${operationType} on ${event.document}`
      );
    } catch (error) {
      logger.error("Failed to write audit log", {error, auditEntry});
      // In production, consider a dead-letter queue or alerting here
    }
  }
);

/**
 * Audit Inventory Item Changes
 *
 * Purpose: SOC 2 Compliance - Tracking Inventory Modifications
 * Trigger: Any write to users/{uid}/items/{itemId}
 */
export const auditItemWrites = onDocumentWritten(
  "users/{uid}/items/{itemId}",
  async (event: any) => {
    const {data, params} = event;
    if (!data) return; // Safe check for data

    const before = data.before?.data() ?? null;
    const after = data.after?.data() ?? null;

    // Determine Operation Type
    let operationType = "UNKNOWN";
    if (!before && after) {
      operationType = "CREATE";
    } else if (before && after) {
      operationType = "UPDATE";
    } else if (before && !after) {
      operationType = "DELETE";
    }

    // Determine User ID (Owner or System)
    // In this path, params.uid is the owner.
    // Ideally we'd want the 'auth' context of the trigger to know WHO,
    // but Firestore triggers don't always reliably provide 'auth'.
    const userId = params.uid ?? "system";

    const auditEntry = {
      domain: "inventory",
      collectionPath: event.document,
      params,
      operationType,
      before,
      after,
      userId,
      eventTime: new Date().toISOString(),
    };

    try {
      await db.collection("audit_logs").add(auditEntry);
      logger.info(
        `Inventory audit log for ${operationType} on ${event.document}`
      );
    } catch (error) {
      logger.error("Failed to write inventory audit log", {error, auditEntry});
    }
  }
);
