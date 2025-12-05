# Backend Security and API Documentation

## API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/alexa` | POST | Alexa Signature + Firebase Token | Alexa voice assistant integration |
| `/api/google` | POST | Google Signature + Firebase Token | Google Assistant integration |

## Security Features (Already Implemented)

### 1. Rate Limiting (`voice-helpers.ts`)
- In-memory rate limiter (per-IP)
- Default: 60 requests per 60 seconds
- Configurable via `VOICE_RATE_LIMIT` and `VOICE_RATE_WINDOW_MS` env vars

### 2. Input Validation (Zod Schemas)
- `AlexaRequestSchema`: Validates Alexa request structure
- `GoogleRequestSchema`: Validates Google Assistant request structure
- Returns 400 with details on validation failure

### 3. Authentication
- Firebase ID token verification via `requireFirebaseUser()`
- Platform signature header checks (Alexa, Google)
- Returns 401 on missing/invalid tokens

### 4. Structured Logging
- `logEvent()`: Logs voice events with sanitization (truncates long strings)
- `logError()`: Logs errors with message/stack (JSON format)

## Firestore Security Rules

| Collection | Access | Notes |
|------------|--------|-------|
| `/users/{userId}` | Owner only | Strict user-ownership model |
| List `/users` | Denied | Prevents data scraping |

Current rules enforce:
- `isOwner()`: Request UID must match document path
- `isIdImmutable()`: Document ID field cannot be changed
- `hasValidIdOnCreate()`: New docs must have matching ID field

## Auction API Rate Limiting

To ensure fairness and system stability during high-frequency auctions, we implement a multi-layered rate limiting strategy.

### Strategy
1.  **Per-User Limit**: 1 bid per second (burst of 3).
    -   Prevents bot spamming while allowing rapid manual bidding.
    -   Implementation: Redis Token Bucket (preferred) or Firestore Atomic Counter (fallback).
2.  **Per-Auction Limit**: 10 bids per second (global).
    -   Prevents hot-spotting on a single document.
    -   Implementation: Firestore Distributed Counter (sharding) if scale requires >1 write/sec.
3.  **DDoS Protection**: Cloud Armor / WAF at the edge.

### Implementation Plan
-   **Phase 1 (MVP)**: Firestore `lastBidTimestamp` check in Security Rules or Cloud Function.
    -   *Pros*: Simple, no extra infra.
    -   *Cons*: Potential contention, higher latency.
-   **Phase 2 (Scale)**: Redis (Memorystore) for low-latency rate limiting.

## Specialized Database Selection (TrueLedger)

As the "TrueLedger" provenance system scales, Firestore's cost model (per-document write/read) may become prohibitive for immutable audit trails.

### Recommendation: Amazon QLDB (Quantum Ledger Database)
-   **Why**: Purpose-built for immutable, cryptographically verifiable transaction logs.
-   **Fit**: Perfect for "TrueLedger" provenance events.
-   **Cost**: Pay for storage and IO, cheaper than Firestore for append-only logs.
-   **Integration**: AWS SDK via Cloud Functions.

### Alternative: Google BigQuery (Append-Only)
-   **Why**: Native Google Cloud integration, massive scale, cheap storage.
-   **Fit**: Good for analytics and "cold" audit logs.
-   **Trade-off**: Higher latency for single-row retrieval compared to QLDB/Firestore.

### Decision
-   **MVP**: Stick with **Firestore** (`provenance_logs` collection) for simplicity.
-   **Scale**: Migrate `provenance_logs` to **Amazon QLDB** when daily events exceed 10,000.

## Recommendations

1. **TODO**: Implement full Alexa signature verification (currently header-only check)
2. **TODO**: Implement full Google JWT/signature verification
3. Consider adding request ID tracking for tracing
