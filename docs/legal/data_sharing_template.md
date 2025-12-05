# Data Sharing Agreement (Template)

**Between:** MyARK Inc. ("Provider") and [PARTNER NAME] ("Recipient")
**Date:** [DATE]

## 1. Purpose
To enable the seamless exchange of asset valuation and inventory data for the purpose of [INSURANCE QUOTING / CLAIMS PROCESSING / RESTORATION ESTIMATES], subject to end-user consent.

## 2. Data Definitions
*   **"Asset Data":** Item description, estimated value, confidence score, and category.
*   **"Visual Verification":** Boolean flag indicating if item existence is verified via Visual Truth.
*   **"Personally Identifiable Information (PII)":** User email, home address (Shared ONLY if explicitly authorized).

## 3. User Consent
*   Data transfer occurs **only** upon explicit OAuth 2.0 authorization by the End User.
*   Consent is granular (e.g., "Share only Jewelry category" or "Share Total Portfolio Value").
*   User may revoke consent at any time via the MyARK Privacy Dashboard.

## 4. Security & Compliance
*   **Transmission:** TLS 1.3 encrypted.
*   **Storage:** Recipient must store data encrypted at rest.
*   **Retention:** Recipient must delete data within 30 days if the User revokes consent or terminates their policy.

## 5. Restrictions
*   Recipient **may not** sell, rent, or trade Asset Data to third parties.
*   Recipient **may not** use Asset Data for marketing unrelated products without opt-in.
