import { getFirestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";

const db = getFirestore();

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
export const createAuctionListing = onCall(
  { enforceAppCheck: true, consumeAppCheckToken: true },
  async (request) => {
    // Assert authentication
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const uid = request.auth.uid;
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
      // [COMPLIANCE] Tax Placeholder
      estimatedTaxRate: 0.0, // TODO: Replace with Stripe Tax API call
      taxJurisdiction: "US",
    };

    await auctionRef.set(auctionDoc);

    return {
      auctionId: auctionRef.id,
      auction: auctionDoc,
    };
  }
);
