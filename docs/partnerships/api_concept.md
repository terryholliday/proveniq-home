# Public API Concept & Strategy (Phase 4)

**Status:** Concept Draft  
**Owner:** Strategic Partnerships Manager + Lead Architect  
**Last Updated:** 2025-05-01

## 1. Vision
Transform MyARK from a consumer app into a "System of Record" platform for the valuables economy. The Public API will allow insurance carriers, restoration experts, and marketplaces to integrate directly with MyARK data (with user consent).

## 2. API Design Principles
- **Style:** RESTful (easier generic adoption) for Phase 1 Public API.
- **Auth:** OAuth 2.0 (Client Credentials for Partners, Authorization Code for User Delegation).
- **Versioning:** URL-based (`/api/v1/...`).

## 3. Core Endpoints (Draft)

### 3.1 Valuation
`POST /api/v1/valuation/quick_estimate`
- **Input:** structured item details (category, brand, condition).
- **Output:** Estimated value range + confidence score.
- **Use Case:** Insurance quote widgets; "What's this worth?" tools on partner sites.

### 3.2 Verification (Visual Truth)
`POST /api/v1/verification/check_image`
- **Input:** Image URL or binary.
- **Output:** True/False match against MyARK registry + tampering probability.
- **Use Case:** Marketplace fraud detection.

### 3.3 Portfolio Import/Export
`GET /api/v1/user/portfolio/summary` (Requires Scoped Consent)
- **Output:** Total value by category, risk score.
- **Use Case:** Faster claims processing; Policy renewal rightsizing.

## 4. White-Label Concept
For strategic partners (e.g., "State Farm optimized by MyARK"), we will offer a **Widget SDK**:
- Drop-in JavaScript library.
- Renders the MyARK "Add Item" flow inside the partner's dashboard.
- Reduces integration friction compared to full API build.

## 5. Next Steps
1. Validating "Quick Estimate" demand with 2 initial insurance prospects.
2. Defining SLA tiers (Free vs. Enterprise).
