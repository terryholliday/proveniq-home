# myarkauctions – Create Auction Endpoint Contract

This repo only contains the MyARK app. Implement the backend in the myarkauctions project using this contract.

## Endpoint
`POST /api/auctions`

## Auth
- Require Firebase ID token (`Authorization: Bearer <idToken>`).
- Server verifies token → `ownerUid`.

## Payload (CreateAuctionInput)
```json
{
  "ownerUid": "string",
  "itemId": "string",
  "itemPath": "string optional",
  "title": "string",
  "description": "string",
  "startingBid": 0,
  "reservePrice": 0,
  "startsAt": "ISO timestamp optional",
  "endsAt": "ISO timestamp optional"
}
```

## Response (CreateAuctionResponse)
```json
{
  "auctionId": "string",
  "auction": {
    "id": "string",
    "ownerUid": "string",
    "itemId": "string",
    "itemPath": "string optional",
    "title": "string",
    "description": "string",
    "startingBid": 0,
    "currentBid": 0,
    "reservePrice": 0,
    "status": "draft|live|closed|cancelled",
    "startsAt": "ISO timestamp optional",
    "endsAt": "ISO timestamp optional",
    "createdAt": "ISO timestamp optional",
    "updatedAt": "ISO timestamp optional"
  }
}
```

## Validation (recommended)
- Use Zod on the server to validate payload and coerce numbers.
- Enforce non-negative `startingBid`/`reservePrice`.
- Require `title`, `description`, `itemId`, `ownerUid`.

## Firestore shape (example)
- Collection: `auctions/{auctionId}`
- Fields: same as `AuctionListing` in `src/lib/auction-types.ts`.
- Optional: subcollection `bids` with `amount`, `bidderUid`, `createdAt`, `updatedAt`.

## Error responses
- 401 if token missing/invalid.
- 403 if `ownerUid` mismatch with token.
- 400 on validation failure (include field-level messages).
- 500 on unexpected errors.

## Notes
- Keep API versioned (`/api/v1/auctions`) if you expect contract changes.
- Add rate limiting/IP allowlisting as needed.
- Log with sanitized payload (no raw request bodies in logs).
