# Multi-Region & Sharding Strategy (Phase 4)

**Owner:** Lead Architect
**Date:** 2025-12-09

## 1. Problem Statement
Phase 4 introduces "Enterprise Partners" (Insurance Carriers) who will onboard millions of items. A single Firestore instance and global Cloud Function deployment will hit:
1.  **Throughput Limits:** Firestore writes (10k/sec limit).
2.  **Noisy Neighbors:** One large partner import slowing down consumer traffic.
3.  **Data Residency:** EU partners requiring data to stay in `europe-west`.

## 2. Proposed Architecture: "Cell-Based" Sharding

### 2.1 The Cell Concept
We will treat the infrastructure as a collection of "Cells".
- **Cell 0 (Global/Consumer):** The current default deployment.
- **Cell N (Dedicated Enterprise):** A complete, isolated replica of the stack for a specific large customer (or region).

### 2.2 Routing Layer
- **Global Load Balancer:** Uses URL path or Header (`X-Tenant-ID`) to route traffic to the correct Cell.
- **Service Directory:** A lightweight lookup (Redis/Edge Config) mapping `TenantID -> CellID`.

### 2.3 Database Sharding
- **Firestore:** Use **Multiple Projects** or **Databases (named databases)** within Google Cloud.
    - `proveniq-prod` (Consumer)
    - `proveniq-prod-eu` (EU Partners)
    - `proveniq-prod-enterprise-a` (Huge Carrier A)
- **Shared Data:** "Market Value" data is replicated *read-only* to all cells from a central "Analytics" project.

## 3. Implementation Plan

### Step 1: Multi-Database Support (Q1)
Refactor `admin-sdk` initialization to accept a `databaseId` parameter based on the request context.

### Step 2: Tenant Context Middleware (Q1)
Implement middleware in Cloud Functions that extracts `X-Tenant-ID`, validates it, and initializes the correct database connection.

### Step 3: EU Region Cell (Q2)
Deploy a full stack clone to `europe-west1` and configure the Global Load Balancer to route `eu.proveniq.io` traffic there.

## 4. Risks & Mitigations
- **Complexity:** Deployment pipelines must manage N cells.
    - *Mitigation:* Terraform / IaaC is mandatory. No manual console changes.
- **Fragmented Analytics:** Hard to get a "global view".
    - *Mitigation:* All cells stream "Anonymized Events" to a single **BigQuery** Data Warehouse.
