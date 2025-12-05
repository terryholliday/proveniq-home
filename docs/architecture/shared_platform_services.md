# Shared Platform Services Definition

**Status:** Draft  
**Owner:** Lead Architect  
**Last Updated:** 2025-05-01

## 1. Objective
To prevent code duplication and ensure consistent security/reliability, we are extracting core capabilities into shared internal libraries (and eventually microservices).

## 2. Core Services

### 2.1 Identity Service (AuthZ/AuthN)
*Centralized management of who is who and what they can do.*
- **Responsibilities:**
    - Minting and validating JWTs.
    - Managing RBAC (Role-Based Access Control) policies.
    - Handling MFA and SSO integration (for B2B).
- **Interface:** `verifyToken(token)`, `checkPermission(user, resource, action)`

### 2.2 Audit Service
*Immutable record of "who did what".*
- **Responsibilities:**
    - Ingesting audit logs from all other services.
    - Signing logs for immutability (TrueLedger integration).
    - Providing search/export API for compliance officers.
- **Schema:** `{ timestamp, actorId, action, targetResource, metadata, signature }`

### 2.3 Notification Service
*Unified communication dispatch.*
- **Responsibilities:**
    - Routing messages to Email (SendGrid), SMS (Twilio), or Push (FCM).
    - Managing user precision (frequency caps, DND hours).
    - Templating and localization.

## 3. Integration Patterns

### 3.1 Library First (Phase 3)
Initially, these "services" will be implemented as shared authorized libraries (`@myark/identity`, `@myark/audit`) within the monorepo. This avoids network overhead while enforcing interface boundaries.

### 3.2 Service Extraction (Phase 4+)
As scaling dictates, these libraries will be swapped for gRPC clients connecting to standalone deployments.
