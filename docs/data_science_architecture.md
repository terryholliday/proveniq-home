# Data Science Architecture & Analytics (Phase 3)

**Status:** Living Document  
**Owner:** Data Scientist & Analytics Lead  
**Last Updated:** 2025-05-01

## 1. Data Pipeline

### 1.1 Ingestion
- **Event Tracking:** Client-side events (Pageview, Click) sent to `analytics/ingest` Cloud Function.
- **Operational Data:** Firestore changes streamed to BigQuery via "Stream Firestore to BigQuery" extension.

### 1.2 Storage (Data Warehouse)
- **Raw Layer:** Immutable JSON logs of every event.
- **Modeled Layer (dbt):** Cleaned tables (`dim_users`, `fct_valuations`, `fct_auctions`).

## 2. Model Lifecycle

### 2.1 Valuation Model (v2)
- **Input:** Item Description + Image Embeddings + Market Trends.
- **Training:** Automated weekly retraining on "Closed Auction" data (Realized Price vs. Predicted Price).
- **Deployment:** TensorFlow Lite model deployed to Cloud Functions for low-latency inference.

### 2.2 Visual Truth (Tamper Detection)
- **Approach:** Ensemble of Error File Analysis (ELA) and PRNU (Photo Response Non-Uniformity).
- **Safety:** Models must pass the "Bias Check" (see AI Safety Policy) before promotion to production.

## 3. Privacy & Compliance
- **PII Redaction:** All text inputs run through DLP (Data Loss Prevention) APIs before entering the analytics warehouse.
- **Aggregated Reporting:** Partner dashboards only show aggregated trends (e.g., "Guitars are up 5%"), never individual user portfolios without explicit consent.
