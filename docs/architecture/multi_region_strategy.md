# Multi-Region and Sharding Strategy (Phase 4 Readiness)

**Status:** Draft  
**Owner:** Lead Architect  
**Last Updated:** 2025-05-01

## 1. Executive Summary
As MyARK expands to enterprise partners and potentially international markets, a single-region architecture will become a bottleneck for latency and a blocker for compliance (GDPR/Data Residency). This document outlines our strategy for sharding user data and operating across multiple cloud regions.

## 2. Multi-Region Architecture

### 2.1 Regional Cells
We will adopt a "Cell-based" architecture where a Cell is a self-contained deployment of the MyARK stack (Frontend + API + Database) in a specific region (e.g., `us-east-1`, `eu-central-1`).

- **Global Control Plane:** Handles authentication (Identity), billing, and routing.
- **Regional Data Plane:** Stores all user content (Inventory, Valuations, Documents).

### 2.2 Routing
Users are routed to their "Home Region" based on their profile setting or IP on signup.
- **Edge Routing:** Route53 / Cloudflare worker routes `api.myark.io` requests to the correct regional load balancer.

## 3. Sharding Strategy

### 3.1 Why Shard?
Even within a single region, high-volume tables (e.g., `Events`, `ValuationLogs`) will exceed single-node database write limits.

### 3.2 Sharding Keys
We will implement application-level sharding logic:
- **TenantID (Enterprise):** All data for a B2B partner resides in the same shard for isolation.
- **UserID (Consumer):** Consumer data is hashed by `UserID` to distribute across 10-50 logical shards.

### 3.3 Data Stores
- **User Metadata (Firestore):** Sharded by `collection` prefix or utilizing Firestore's auto-sharding. 
- **Time-Series (Valuations/Events):** Moved to TimescaleDB or BigQuery, partitioned by `Date` and `Region`.

## 4. Implementation Phase Plan

- **Phase 3 (Now):** Implement logical separation in code (ensure all queries use `TenantID` or `UserID` scope).
- **Phase 4 (Next):** Deploy `eu-central-1` pilot cell. Migrate 5% of traffic.
- **Phase 5 (Future):** Full dynamic routing and automated cell rebalancing.
