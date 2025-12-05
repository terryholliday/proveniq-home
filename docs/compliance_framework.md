# Compliance & Regulatory Framework (Phase 3)

**Status:** Living Document  
**Owner:** Compliance Officer  
**Last Updated:** 2025-05-01

## 1. Privacy & Data Rights (GDPR/CCPA)

### 1.1 Right to be Forgotten
- **Mechanism:** "Delete Account" button triggers a cascading delete:
    - Firestore: User document + Subcollections.
    - Storage: All images (except those part of a sold auction, retained for legal provenance).
    - Analytics: User ID redacted/anonymized.

### 1.2 Data Portability
- **Export:** Users can download a JSON/PDF of their entire inventory (The "Digital Binder").

## 2. Financial Regulation (Auctions)

### 2.1 Auctioneer Licensing
- **Model:** MyARK operates as a "Platform Provider" (like eBay), not the Auctioneer of Record.
- **Disclaimer:** "MyARK is not a broker or auctioneer. Transactions are solely between Buyer and Seller."
- **Restricted Items:** Firearms, alcohol, and protected wildlife are strictly prohibited (Pre-moderation by Vision API).

### 2.2 KYC / AML (Anti-Money Laundering)
- **Threshold:** Sellers with > $10,000 in annual sales must complete Identity Verification (Stripe Identity).
- **Reporting:** 1099-K forms automatically generated for sellers exceeding IRS thresholds.

## 3. AI Ethics Compliance
- **Transparency:** All AI-generated text/values are labeled.
- **Contestability:** Users can manually override an AI Valuation (flagged as "User Override" in the ledger).
