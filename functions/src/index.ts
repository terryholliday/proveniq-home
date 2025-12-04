
// functions/src/index.ts
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getVertexAI, HarmBlockThreshold, HarmCategory } from "firebase-admin/vertex-ai";

if (!admin.apps.length) {
  initializeApp();
}

const db = getFirestore();

// Interfaces for input validation
interface AuthedRequest {
  auth?: {
    uid: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    token: any;
  }
}

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

    const userId = event.data?.after.data()?.bidderUid ?? "system";

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
 * 2. AUCTIONS: CREATE LISTING FROM A MyARK ITEM
 *    - Frontend: MyARK user chooses an item, hits "List on ARKIVE"
 * ==========================================================================*/

interface CreateAuctionInput {
  itemPath: string; // e.g. "users/<uid>/items/<itemId>"
  title: string;
  description?: string;
  startingBid: number;
  reservePrice?: number;
  startsAt?: string | null; // ISO string, optional
  endsAt?: string | null; // ISO string, optional
}

/**
 * HTTPS callable: createAuctionListing
 *
 * - Authenticated MyARK user ONLY
 * - Verifies the itemPath belongs to the caller (same uid)
 * - Creates an auction doc linked to the golden record item
 */
export const createAuctionListing = onCall<CreateAuctionInput>(
  { enforceAppCheck: true, consumeAppCheckToken: true },
  async (request) => {
    // Assert authentication
    const context = request as AuthedRequest;
    if (!context.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const uid = context.auth.uid;
    const data = request.data as Partial<CreateAuctionInput>;

    if (!data.itemPath || typeof data.itemPath !== "string") {
      throw new HttpsError("invalid-argument", "itemPath is required.");
    }
    if (!data.title || typeof data.title !== "string") {
      throw new HttpsError("invalid-argument", "title is required.");
    }
    if (typeof data.startingBid !== "number" || data.startingBid < 0) {
      throw new HttpsError("invalid-argument", "startingBid invalid.");
    }

    // Basic check: itemPath must start with "users/{uid}/items"
    const expectedPrefix = `users/${uid}/items/`;
    if (!data.itemPath.startsWith(expectedPrefix)) {
      throw new HttpsError(
        "permission-denied",
        "You can only create auctions for items in your own MyARK inventory."
      );
    }

    // Optional: verify the item actually exists
    const itemSnap = await db.doc(data.itemPath).get();
    if (!itemSnap.exists) {
      throw new HttpsError("not-found", "Item not found.");
    }

    const auctionRef = db.collection("auctions").doc();
    const now = admin.firestore.Timestamp.now();

    const auctionDoc = {
      ownerUid: uid,
      itemPath: data.itemPath,
      title: data.title,
      description: data.description ?? "",
      startingBid: data.startingBid,
      currentBid: data.startingBid,
      reservePrice: data.reservePrice ?? null,
      status: "draft", // 'draft' -> 'live' -> 'closed'
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      createdAt: now,
      updatedAt: now,
    };

    await auctionRef.set(auctionDoc);

    return {
      auctionId: auctionRef.id,
      auction: auctionDoc,
    };
  }
);


/* ============================================================================
 * 3. AUCTIONS: PLACE BID
 *    - Frontend: ARKIVE portal user places a bid on a listing
 * ==========================================================================*/

interface PlaceBidInput {
  auctionId: string;
  amount: number;
}

/**
 * HTTPS callable: placeBid
 *
 * - Any authenticated user can bid
 * - Enforces basic business rules:
 *      - Auction exists and is 'live'
 *      - Bid > currentBid
 * - Writes a bid doc under /auctions/{auctionId}/bids
 * - Updates auction.currentBid
 *
 * NOTE: This is a skeleton; refine business rules (increments, reserve, etc.)
 */
export const placeBid = onCall<PlaceBidInput>(
  { enforceAppCheck: true, consumeAppCheckToken: true },
  async (request) => {
    // Assert authentication
    const context = request as AuthedRequest;
    if (!context.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const bidderUid = context.auth.uid;
    const data = request.data as Partial<PlaceBidInput>;

    if (!data.auctionId || typeof data.auctionId !== "string") {
      throw new HttpsError("invalid-argument", "auctionId is required.");
    }
    if (typeof data.amount !== "number" || data.amount <= 0) {
      throw new HttpsError("invalid-argument", "amount must be positive.");
    }

    const auctionRef = db.collection("auctions").doc(data.auctionId);
    const auctionSnap = await auctionRef.get();

    if (!auctionSnap.exists) {
      throw new HttpsError("not-found", "Auction not found.");
    }

    interface AuctionDoc {
      status?: string;
      currentBid?: number;
      startingBid?: number;
    }

    const auction = auctionSnap.data() as AuctionDoc;

    if (auction.status !== "live") {
      throw new HttpsError("failed-precondition", "Auction is not live.");
    }

    const currentBid = typeof auction.currentBid === "number" ?
      auction.currentBid : auction.startingBid;
    if (data.amount <= currentBid) {
      throw new HttpsError(
        "failed-precondition",
        "Bid must be higher than current bid."
      );
    }

    const now = admin.firestore.Timestamp.now();

    // Create bid doc
    const bidsCol = auctionRef.collection("bids");
    const bidRef = bidsCol.doc();

    const bidDoc = {
      auctionId: auctionRef.id,
      bidderUid,
      amount: data.amount,
      createdAt: now,
      updatedAt: now,
    };

    // Use a transaction to update currentBid safely
    await db.runTransaction(async (tx) => {
      const freshSnap = await tx.get(auctionRef);
      if (!freshSnap.exists) {
        throw new HttpsError("not-found", "Auction not found.");
      }
      const fresh = freshSnap.data() as AuctionDoc;
      const freshCurrent = typeof fresh.currentBid === "number" ?
        fresh.currentBid : fresh.startingBid;

      if (data.amount! <= freshCurrent) {
        throw new HttpsError(
          "failed-precondition",
          "Bid must be higher than current bid (race condition)."
        );
      }

      tx.set(bidRef, bidDoc);
      tx.update(auctionRef, {
        currentBid: data.amount,
        updatedAt: now,
      });
    });

    return {
      bidId: bidRef.id,
      amount: data.amount,
    };
  }
);

/* ============================================================================
 * 4. INVENTORY: SCAN ITEM IMAGE WITH AI
 * ==========================================================================*/

interface ScanItemImageInput {
  itemId: string;
  imagePath: string;
}

export const scanItemImage = onCall(
  { enforceAppCheck: true, consumeAppCheckToken: true },
  async (request) => {
    const { itemId, imagePath } = request.data as ScanItemImageInput;
    const uid = request.auth.uid;

    if (!itemId || !imagePath) {
      throw new HttpsError("invalid-argument", "Missing itemId or imagePath");
    }

    const file = getStorage().bucket().file(imagePath);
    const [exists] = await file.exists();
    if (!exists) {
      throw new HttpsError("not-found", "Image file not found");
    }

    const vertexAI = getVertexAI();
    const generativeModel = vertexAI.getGenerativeModel({
      model: "gemini-1.0-pro-vision-001",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      ],
    });

    const image = { gcsUri: `gs://${file.bucket.name}/${file.name}` };
    const prompt = "Analyze this image of an item. Extract the item's name, suggest a category, and write a brief description. Also, extract any EXIF metadata you can find. Return the data as a JSON object with keys: name, category, description, exif.";

    try {
      const imagePart: { fileData: { gcsUri: string } } = { fileData: image };
      const resp = await generativeModel.generateContent([prompt, imagePart]);
      const content = resp.response.candidates[0].content;

      const data = JSON.parse(content.parts[0].text);

      await db.collection("users").doc(uid).collection("items").doc(itemId).set(data, { merge: true });

      return data;
    } catch (error) {
      logger.error("Error scanning image: ", error);
      throw new HttpsError("internal", "Error processing image with AI");
    }
  }
);

export * from "./offboard_employee";
