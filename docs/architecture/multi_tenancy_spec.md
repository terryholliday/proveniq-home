# Multi-Tenancy Specification (Phase 4)

**Status:** Living Document  
**Owner:** Lead Architect  
**Last Updated:** 2025-05-01

## 1. Tenancy Model

### 1.1 Hybrid Approach
To balance operational complexity with data isolation, MyARK will use a **Shared Infrastructure, Logic-Separated Data** model.
- **Database:** Single Firestore instance.
- **Isolation:** Enforcement via `tenantId` field on every root document.
- **Security:** Logic-layer enforcement (Middleware) + Storage Rules.

### 1.2 Tenant Types
1.  **Consumer:** The default. `tenantId` = `consumer`.
2.  **Partner:** Insurance Carriers / Enterprises. `tenantId` = `uuid` (e.g., `srv_statefarm_123`).
3.  **System:** Internal ops. `tenantId` = `system`.

## 2. Data Propagation

### 2.1 The Context Object
Every internal function call must pass a `TenantContext` object:
```typescript
interface TenantContext {
  tenantId: string;
  userId?: string;
  roles: string[];
}
```

### 2.2 API Layer
- **Public API:** API Keys identify the Partner -> resolves `tenantId`.
- **Client App:** JWT Custom Claims include `tenantId`.

## 3. Enforcement Rules

### 3.1 Write Path
- **Middleware:** The `withTenancy` wrapper checks that the `write` operation targets a path matching the context's `tenantId`.
- **Validation:** Failed validation throws `403 Forbidden (Tenant Mismatch)`.

### 3.2 Read Path
- **Queries:** All Firestore queries *must* include a `.where('tenantId', '==', ctx.tenantId)` clause.
- **Audit:** Any query *missing* this clause logs a `CRITICAL_WARN` to the security audit log.

## 4. Migration Strategy
1.  Backfill all existing documents with `tenantId: 'consumer'`.
2.  Deploy enforced middleware.
3.  Onboard first Pilot Partner.
