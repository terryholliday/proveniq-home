import { getIdToken, Auth } from "firebase/auth";
import type { CreateAuctionInput, CreateAuctionResponse } from "../../../shared/types";

const getBaseUrl = () => process.env.NEXT_PUBLIC_ARKIVE_BASE_URL || process.env.ARKIVE_BASE_URL || "";

export async function createAuctionListing(auth: Auth, payload: CreateAuctionInput): Promise<CreateAuctionResponse> {
  if (!auth.currentUser) {
    throw new Error("User must be signed in to create an auction");
  }

  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("ARKIVE_BASE_URL is not configured");
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
    throw new Error(`ARKive create auction failed (${res.status}): ${text}`);
  }

  return res.json();
}
