# Multi-Tenant QA & Isolation Strategy (Phase 4)

**Status:** Draft  
**Owner:** QA Specialist  
**Last Updated:** 2025-05-01

## 1. The Challenge
In a shared database model, a simple bug in a `where` clause can expose one partner's data to another. Testing must be paranoid and adversarial.

## 2. Test Types

### 2.1 "Tenant Bleed" Tests (Automated)
*   **Concept:** Create two distinct tenants (Tenant A, Tenant B).
*   **Action:** Tenant A creates an item "Secret Item A".
*   **Verify:** Tenant B queries for *all items*.
*   **Assert:** "Secret Item A" is NOT present in the result set.

### 2.2 Role-Based Access (RBAC) within Tenants
*   **Scenario:** Tenant Admin vs Tenant Viewer.
*   **Verify:** Viewer cannot modify the "Company Settings" document.

## 3. Test Data Management
*   **Cleanup:** Tests must aggressively delete created tenants to prevent cluttering the database with thousands of "Test Corp 123" entities.
*   **Isolation:** Tests run in a dedicated `staging-qa` environment, never production.

## 4. CI Integration
*   These tests run on every Pull Request that modifies `src/lib/tenancy.ts` or `firestore.rules`.
