import { getIdToken, Auth } from "firebase/auth";
import type { CreateAuctionInput, CreateAuctionResponse } from "@/lib/auction-types";

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_PROVENIQ_BIDS_BASE_URL ||
  process.env.PROVENIQ_BIDS_BASE_URL ||
  "";

export async function createAuctionListing(auth: Auth, payload: CreateAuctionInput): Promise<CreateAuctionResponse> {
  if (!auth.currentUser) {
    throw new Error("User must be signed in to create an auction");
  }

  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("PROVENIQ_BIDS_BASE_URL is not configured");
  }

  const token = await getIdToken(auth.currentUser, true);
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/auctions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Proveniq Bids create auction failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function fetchMyAuctions(auth: Auth, ownerUid: string) {
  if (!auth.currentUser) {
    throw new Error("User must be signed in to fetch auctions");
  }

  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("PROVENIQ_BIDS_BASE_URL is not configured");
  }

  const token = await getIdToken(auth.currentUser, true);
  const url = `${baseUrl.replace(/\/$/, "")}/api/auctions?ownerUid=${encodeURIComponent(ownerUid)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Proveniq Bids fetch auctions failed (${res.status}): ${text}`);
  }

  return res.json();
}
