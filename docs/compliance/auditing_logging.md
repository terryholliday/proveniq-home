# SOC 2 & ISO 27001 Compliance: Auditing & Logging

## 1. Auditing System Design

This system implements **immutable, server-side audit logging** for all critical transaction data, specifically targeting bid placement and inventory modification.

### 1.1 Components

*   **Trigger**: Firebase Cloud Functions (Gen 2) `onDocumentWritten`
*   **Target**: `auctions/{auctionId}/bids/{bidId}`
*   **Storage**: Firestore `audit_logs` collection (Phase 1) -> BigQuery (Phase 2/Long-term)
*   **Enforcement**: Firestore Security Rules deny all client writes to `audit_logs`.

### 1.2 Immutability Strategy

1.  **Server-Side Only**: The `audit_logs` collection is locked down. No client SDK (Web/Mobile) can write to it. Only the Admin SDK (running in Cloud Functions) has permission.
2.  **Append-Only Logic**: The auditing function only performs `.add()` operations. It never updates or deletes existing logs.
3.  **Comprehensive Capture**: Logs capture `before` and `after` snapshots, ensuring a complete delta can be reconstructed.

## 2. IAM & Access Control

*   **Cloud Functions Service Account**:
    *   Requires `roles/datastore.user` to write to `audit_logs`.
    *   Default App Engine service account is sufficient for standard deployments.
*   **Admins**:
    *   Read access to `audit_logs` is restricted to users with `request.auth.token.admin == true`.
    *   This requires a custom claim management system (e.g., Firebase Admin SDK script).

## 3. Data Governance

*   **Retention**: Firestore documents are retained indefinitely by default.
*   **Export Strategy**: For long-term retention and cost optimization, a scheduled function will export `audit_logs` documents older than 90 days to a **BigQuery** immutable append-only table.

## 4. Code Reference

### Cloud Function (Audit Trigger)

See `functions/src/index.ts` for the implementation of `auditBidWrites`.

### Security Rules

See `firestore.rules` for the enforcement of the `isValidBid` schema and the protection of the `audit_logs` collection.
