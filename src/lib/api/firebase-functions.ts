// src/lib/api/firebase-functions.ts
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

// Initialize Functions (assuming app is already initialized in src/lib/firebase.ts)
const functions = getFunctions(getApp(), "us-central1");

// --- Types ---

// Existing types (Phase 2)
export interface SubmitAuctionItemInput {
  name: string;
  description?: string;
  startingBid: number;
  endDate: string; // ISO string
}

export interface PlaceBidInput {
  auctionId: string;
  bidAmount: number;
}

export interface AuctionResponse {
  success: boolean;
  itemId?: string;
  auctionId?: string;
  bidAmount?: number;
  auction?: any; // For createAuctionListing response
  bidId?: string; // For placeBid response
}

// New Types (Phase 2-5 refined)
export interface CreateAuctionInput {
  itemPath: string;
  title: string;
  description?: string;
  startingBid: number;
  reservePrice?: number;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface CreateAuctionResponse {
  auctionId: string;
  auction: any;
}

// --- Hooks / API Calls ---

export const submitAuctionItem = async (data: SubmitAuctionItemInput): Promise<AuctionResponse> => {
  const submitFn = httpsCallable<SubmitAuctionItemInput, AuctionResponse>(functions, 'submitAuctionItem');
  try {
    const result = await submitFn(data);
    return result.data;
  } catch (error: any) {
    console.error("Failed to submit item:", error);
    throw error;
  }
};

export const placeBid = async (data: PlaceBidInput): Promise<AuctionResponse> => {
  const bidFn = httpsCallable<PlaceBidInput, AuctionResponse>(functions, 'placeBid');
  try {
    const result = await bidFn(data);
    return result.data;
  } catch (error: any) {
    console.error("Failed to place bid:", error);
    throw error;
  }
};

export const createAuctionListing = async (data: CreateAuctionInput): Promise<CreateAuctionResponse> => {
  const createFn = httpsCallable<CreateAuctionInput, CreateAuctionResponse>(functions, 'createAuctionListing');
  try {
    const result = await createFn(data);
    return result.data;
  } catch (error: any) {
    console.error("Failed to create auction listing:", error);
    throw error;
  }
};
