// src/hooks/use-auction.ts
import { useState } from 'react';
import { 
  submitAuctionItem, 
  placeBid, 
  SubmitAuctionItemInput, 
  PlaceBidInput,
  AuctionResponse
} from '@/lib/api/firebase-functions';
import { useUser } from '@/firebase'; // Assuming useUser hook exists in project

export function useAuction() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAuction = async (data: SubmitAuctionItemInput): Promise<AuctionResponse | null> => {
    if (!user) {
      setError("You must be logged in to create an auction.");
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await submitAuctionItem(data);
      return response;
    } catch (err: unknown) {
      console.error("Auction creation error:", err);
      // Try to extract a friendly message if it's an HttpsError
      const message = err instanceof Error && err.message ? err.message : "Failed to create auction.";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const bidOnItem = async (data: PlaceBidInput): Promise<AuctionResponse | null> => {
    if (!user) {
      setError("You must be logged in to place a bid.");
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await placeBid(data);
      return response;
    } catch (err: unknown) {
      console.error("Bidding error:", err);
      const message = err instanceof Error && err.message ? err.message : "Failed to place bid.";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createAuction,
    bidOnItem,
    isLoading,
    error
  };
}
