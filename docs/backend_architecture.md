# Backend Architecture & Risk Assessment (Phase 3)

**Status:** Living Document  
**Owner:** Backend/DevOps Engineer  
**Last Updated:** 2025-05-01

## 1. System Overview

MyARK's backend is a serverless architecture primarily built on the **Google Cloud Platform (GCP)** via **Firebase**.

### 1.1 Compute / API Layer
- **Firebase Cloud Functions (v2):** Hosting the API (GraphQL/REST) and event-driven triggers.
- **Runtime:** Node.js 18/20 (TypeScript).
- **Triggers:**
    - HTTP (External API, Frontend requests).
    - Firestore Triggers (Indexing, Audit logs).
    - Pub/Sub (Scheduled cron jobs).

### 1.2 Data Storage
- **Firestore:** Primary document store for user profiles, inventory, and application state.
- **Firebase Storage:** Blobs (images, documents).
- **TrueLedger (Prototype):** Merkle tree roots stored in Firestore; raw proofs in Storage.

### 1.3 Authentication
- **Firebase Auth:** Handles user identity, JWT minting, and OIDC providers.

## 2. Key Data Flows

### A. Item Valuation Flow
1. User provides item details + photos via Frontend.
2. `valuation_engine` Function triggered.
3. AI Models (heuristic + LLM) process input.
4. Result stored in `valuations` sub-collection.
5. User notified via Firestore snapshot listener.

### B. Visual Truth Verification
1. Photos uploaded to Storage.
2. `onFinalize` trigger invokes `provenance_engine`.
3. Image hashing (pHash/SHA) calculated.
4. Hashes committed to immutable ledger log.
5. Verification badges updated on `InventoryItem`.

## 3. Risks & Technical Debt

### 3.1 Scalability
- **Firestore Writes:** Write rate limited to ~10k/sec globally, but 1/sec per document. High-concurrency counters or global logs will become hot spots.
- **Cold Starts:** Serverless functions may introduce latency for API partners requiring SLA.

### 3.2 Coupling
- Much of the business logic currently resides directly inside Cloud Function handlers, making it hard to test in isolation or port to containers (K8s) later.

### 3.3 Security
- **Rule Complexity:** Firestore Security Rules are becoming complex and hard to audit. Migration to backend-enforced RBAC (via "Shared Identity Service") is recommended for Phase 4.
