# Database Architecture

## 1. High-Level Design

This hybrid database architecture leverages **Firestore (NoSQL)** for high-velocity transactional data and **Firebase Data Connect (Cloud SQL/PostgreSQL)** for structured asset provenance and relational integrity. This design is fully aligned with SOC 2 requirements for security, encryption, and auditability.

### Components

*   **Firestore (NoSQL)**
    *   **Usage**: Real-time bids, live auction states, user profiles, ephemeral UI state.
    *   **Justification**: High write throughput, native real-time SDKs, tight integration with Firebase Auth/Functions.
    *   **SOC 2**: Automatic encryption at rest (Google-managed keys), granular security rules.

*   **Firebase Data Connect → Cloud SQL (PostgreSQL)**
    *   **Usage**: Inventory items, ownership history, chain-of-custody, settlement records, legal documents.
    *   **Justification**: Strong relational constraints, ACID transactions, complex SQL queries, immutable ledgers.
    *   **SOC 2**: Canonical source of truth, referential integrity, encryption at rest (AES-256), private IP access.

### Architecture Diagram

```
+----------------+      +------------------+      +-----------------+
|   Client App   |<---->|  Firebase Auth   |      | Firebase Hosting|
| (Web/Mobile)   |      +------------------+      +-----------------+
+--------^-------+             |
         |                     | Authentication & Authorization
         |                     |
+--------v---------------------+------------------------v-------+
|                               Firebase Platform                 |
|                                                                 |
| +-------------------------------------------------------------+ |
| |                        Firestore (NoSQL)                    | |
| | - User Profiles, Dynamic Inventory, Real-time Bids          | |
| | - High R/W velocity, transactional consistency, real-time   | |
| | - SOC 2: Encryption (At Rest: AES-256; In Transit: TLS 1.2+) | |
| +-------------------------------------------------------------+ |
|                                   |                             |
|                                   | Firebase Data Connect       |
|                                   | (Managed connection + Proxy) |
|                                   v                             |
| +-------------------------------------------------------------+ |
| |                     Cloud SQL (PostgreSQL)                  | |
| | - Asset Provenance, Ownership History, Legal Records        | |
| | - Relational integrity, complex queries, immutable ledger   | |
| | - SOC 2: Private IP, IAM Authentication, Encryption at Rest | |
| +-------------------------------------------------------------+ |
+---------------------------------------------------------------+
```

## 2. Infrastructure Setup

### 2.1 Cloud SQL / PostgreSQL Setup

The following commands create a hardened Cloud SQL instance. **Private IP** is recommended for SOC 2 compliance to strictly limit network exposure.

```bash
# Variables
PROJECT_ID="your-project-id"
REGION="us-central1"
INSTANCE_NAME="inventory-pg-prod"
DB_NAME="inventory_db"

gcloud config set project $PROJECT_ID

# Create Cloud SQL Postgres instance
# --availability-type=regional for High Availability (SOC 2 requirement for critical systems)
# --enable-point-in-time-recovery for Disaster Recovery (SOC 2 requirement)
gcloud sql instances create $INSTANCE_NAME \
  --database-version=POSTGRES_15 \
  --tier=db-custom-2-7680 \
  --region=$REGION \
  --storage-auto-increase \
  --availability-type=regional \
  --no-backup-retention-period \
  --enable-point-in-time-recovery

# Create database
gcloud sql databases create $DB_NAME --instance=$INSTANCE_NAME
```

### 2.2 Firebase Data Connect Setup

Initialize Data Connect to bridge Firebase and Cloud SQL.

```bash
firebase init dataconnect
# Follow prompts:
# - Select the Cloud SQL instance created above
# - Configure IAM roles automatically
```

### 2.3 SOC 2 Security Considerations

*   **Encryption at Rest**:
    *   **Firestore**: Encrypted by default using Google-managed keys.
    *   **Cloud SQL**: Encrypted by default using AES-256.
    *   **Enhancement**: Use Customer-Managed Encryption Keys (CMEK) if strictly required by specific client contracts.
*   **Encryption in Transit**: All traffic between Client, Firebase, and Cloud SQL is encrypted via TLS 1.2+.
*   **Access Control**:
    *   **Firestore**: Firebase Security Rules based on Auth UIDs.
    *   **Cloud SQL**: IAM database authentication (via Data Connect) + Private IP peering.
*   **Auditing**: Point-in-time recovery enabled on Cloud SQL. Firestore changes audited via Cloud Functions.

## 3. Configuration Files

### 3.1 `dataconnect.yaml` (Example)

```yaml
specVersion: 'v1alpha'
serviceId: 'my-inventory-service'
location: 'us-central1'
schema:
  source: './schema.gql'
  datasource:
    type: 'cloud-sql-postgres'
    instanceId: 'inventory-pg-prod'
    database: 'inventory_db'
connector:
  source: './connector.yaml'
```
