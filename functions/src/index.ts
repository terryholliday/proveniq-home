
// functions/src/index.ts
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
// import { getVertexAI, HarmBlockThreshold, HarmCategory } from "firebase-admin/vertex-ai";

if (!admin.apps.length) {
  initializeApp();
}

const db = getFirestore();

// Interfaces for input validation
// Interfaces for input validation
// (AuthedRequest removed as it is unused)

/**
 * Utility: now timestamp
 * @return {string} ISO date string
 */
function nowISO(): string {
  return new Date().toISOString();
}

/* ============================================================================
 * 1. AUDIT LOGGING
 *    - Items (MyARK golden records)
 *    - Bids (ARKIVE auctions)
 * ==========================================================================*/

/**
 * Audit writes to MyARK inventory items (golden record).
 * Path: users/{uid}/items/{itemId}
 */
export const auditItemWrites = onDocumentWritten(
  "users/{uid}/items/{itemId}",
  (event) => {
    const { data, params } = event;

    const before = data?.before?.data() ?? null;
    const after = data?.after?.data() ?? null;

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
      documentPath: event.document,
      params,
      operationType,
      before,
      after,
      userId,
      eventTime: nowISO(),
    };

    logger.info("Writing inventory audit log", { auditEntry });

    return db.collection("audit_logs").add(auditEntry);
  }
);

/**
 * Audit writes to ARKIVE bids.
 * Path: auctions/{auctionId}/bids/{bidId}
 */
export const auditBidWrites = onDocumentWritten(
  "auctions/{auctionId}/bids/{bidId}",
  (event) => {
    const { data, params } = event;

    const before = data?.before?.data() ?? null;
    const after = data?.after?.data() ?? null;

    let operationType = "UNKNOWN";
    if (!before && after) {
      operationType = "CREATE";
    } else if (before && after) {
      operationType = "UPDATE";
    } else if (before && !after) {
      operationType = "DELETE";
    }

    // FIX: Use before data on DELETE to avoid losing record of whose bid was deleted
    const dataSnapshot = after ? event.data?.after : event.data?.before;
    const userId = dataSnapshot?.data()?.bidderUid ?? "system";

    const auditEntry = {
      domain: "auctions",
      documentPath: event.document,
      params,
      operationType,
      before,
      after,
      userId,
      eventTime: nowISO(),
    };

    logger.info("Writing bid audit log", { auditEntry });

    return db.collection("audit_logs").add(auditEntry);
  }
);


/* ============================================================================
 * 2. AUCTIONS & BIDS
 *    - Logic moved to ./auction_api.ts
 * ==========================================================================*/

export * from "./auction_api";


/* ============================================================================
 * 4. INVENTORY: SCAN ITEM IMAGE WITH AI
 * ==========================================================================*/


/*
export const scanItemImage = onCall(
  { enforceAppCheck: true, consumeAppCheckToken: true },
  async (request) => {
    // ... (Commented out due to missing firebase-admin/vertex-ai module)
    throw new HttpsError("unimplemented", "Vertex AI module missing.");
  }
);
*/

export * from "./offboard_employee";
export * from "./sandbox/api";
export * from "./rtbf";
export * from "./compliance_monitor";

