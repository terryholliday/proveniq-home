import { getFirestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import Stripe from "stripe";
import { createBidRateLimiter } from "./rate_limiter";

const db = getFirestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  // apiVersion: "2024-11-20", // Let it default or use latest
});

// Rate limiter for bid operations
const bidRateLimiter = createBidRateLimiter();

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

    // [COMPLIANCE] Calculate Tax via Stripe
    let estimatedTaxRate = 0.0;
    const taxJurisdiction = "US";

    try {
      // In a real scenario, we'd need the buyer's address. 
      // For listing creation, we might estimate based on the seller's location or a default.
      // Here we assume a default FL location for estimation purposes.
      if (process.env.STRIPE_SECRET_KEY) {
        const calculation = await stripe.tax.calculations.create({
          currency: 'usd',
          line_items: [{
            amount: Math.round(data.startingBid * 100), // cents
            reference: 'L-1',
            tax_behavior: 'exclusive',
            quantity: 1,
          }],
          customer_details: {
            address: {
              country: 'US',
              state: 'FL', // Defaulting to FL for estimation
              postal_code: '33101',
            },
            address_source: 'shipping',
          },
        });
        // Calculate effective rate from the tax amount
        const taxAmount = calculation.tax_amount_exclusive;
        if (taxAmount > 0) {
          estimatedTaxRate = taxAmount / (data.startingBid * 100);
        }
      } else {
        console.warn("Stripe Secret Key not found. Using default tax rate.");
        estimatedTaxRate = 0.07; // Fallback to 7%
      }
    } catch (e) {
      console.error("Stripe Tax Calculation Failed:", e);
      // Fallback or rethrow depending on strictness
      estimatedTaxRate = 0.07;
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
      estimatedTaxRate: estimatedTaxRate,
      taxJurisdiction: taxJurisdiction,
    };

    await auctionRef.set(auctionDoc);

    return {
      auctionId: auctionRef.id,
      auction: auctionDoc,
    };
  }
);

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
 */
export const placeBid = onCall(
  { enforceAppCheck: true, consumeAppCheckToken: true },
  async (request) => {
    // Assert authentication
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const bidderUid = request.auth.uid;
    const data = request.data as Partial<PlaceBidInput>;

    // [RATE LIMIT] Check per-user bid rate
    const rateLimitKey = `bid:user:${bidderUid}`;
    const rateLimitResult = await bidRateLimiter.checkLimit(rateLimitKey);

    if (!rateLimitResult.allowed) {
      throw new HttpsError(
        "resource-exhausted",
        `Too many bids. Please wait ${Math.ceil((rateLimitResult.retryAfterMs || 1000) / 1000)} seconds.`
      );
    }

    if (!data.auctionId || typeof data.auctionId !== "string") {
      throw new HttpsError("invalid-argument", "auctionId is required.");
    }
    if (typeof data.amount !== "number" || data.amount <= 0) {
      throw new HttpsError("invalid-argument", "amount must be positive.");
    }

    const auctionRef = db.collection("auctions").doc(data.auctionId);
    const now = admin.firestore.Timestamp.now();

    interface AuctionDoc {
      status?: string;
      currentBid?: number;
      startingBid?: number;
    }

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

      if (fresh.status !== "live") {
        throw new HttpsError("failed-precondition", "Auction is not live.");
      }

      const freshCurrent = typeof fresh.currentBid === "number" ?
        fresh.currentBid : fresh.startingBid;

      if (data.amount! <= (freshCurrent || 0)) {
        throw new HttpsError(
          "failed-precondition",
          "Bid must be higher than current bid."
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

