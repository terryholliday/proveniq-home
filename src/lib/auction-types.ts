export type AuctionStatus = 'draft' | 'live' | 'closed' | 'cancelled';

// Minimal EXIF subset for provenance without leaking PII
export interface ExifSummary {
  Make?: string;
  Model?: string;
  DateTimeOriginal?: string;
  LensModel?: string;
  FNumber?: number;
  FocalLength?: number;
  ISO?: number;
  ShutterSpeedValue?: number;
  // Optionally include redacted/rounded GPS for authenticity checks
  GPSLatitude?: number;
  GPSLongitude?: number;
}

export interface AuthenticityMetadata {
  photoVerified?: boolean; // e.g., not a screenshot, original capture
  geoVerified?: boolean;   // e.g., geotag present/validated
  imageHash?: string;      // optional content hash for integrity
  notes?: string;
}

// Golden record shape shared across apps
export interface InventoryItemCore {
  id: string;
  ownerUid: string;
  name: string;
  category: string;
  description: string;
  purchasePrice?: number;
  estimatedValue?: number;
  location?: string;
  container?: string;
  images?: string[];
  exif?: ExifSummary;
  createdAt?: string;
  updatedAt?: string;
  listingId?: string | null;
  listingStatus?: AuctionStatus | null;
}

export interface AuctionListing {
  id: string; // auctionId
  ownerUid: string;
  itemId: string;
  itemPath?: string;
  title: string;
  description: string;
  startingBid: number;
  currentBid: number;
  reservePrice?: number | null;
  status: AuctionStatus;
  startsAt?: string;
  endsAt?: string;
  exif?: ExifSummary;
  authenticity?: AuthenticityMetadata;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAuctionInput {
  ownerUid: string;
  itemId: string;
  itemPath?: string;
  title: string;
  description: string;
  startingBid: number;
  reservePrice?: number;
  startsAt?: string;
  endsAt?: string;
  exif?: ExifSummary;
  authenticity?: AuthenticityMetadata;
}

export interface CreateAuctionResponse {
  auctionId: string;
  auction: AuctionListing;
}
