# QA Strategy & Architecture (Phase 3)

**Status:** Living Document  
**Owner:** QA Specialist  
**Last Updated:** 2025-05-01

## 1. Testing Pyramid Strategy
We invest most heavily in fast, reliable tests at the bottom of the pyramid.

### 1.1 Unit Tests (50%)
- **Scope:** Individual utilities (e.g., `calculateValuation`), hooks, and robust React components.
- **Tool:** Vitest + React Testing Library.
- **Target:** > 80% coverage on core logic `src/lib` and `src/ai`.

### 1.2 Integration Tests (30%)
- **Scope:** Feature flows (e.g., "Wizard completes step 2 -> step 3").
- **Tool:** Vitest (with mocked Firestore) or Playwright (Component Testing).
- **Focus:** Data flow between components and context providers.

### 1.3 End-to-End (E2E) Tests (20%)
- **Scope:** Critical User Journeys (CUJs) running against a staged backend.
- **Tool:** Playwright.
- **Critical Paths:**
    1.  User Signup/Login.
    2.  Create Item + Photo Upload.
    3.  Generate Valuation.
    4.  Visual Truth Verification.

## 2. Automated Quality Gates

### 2.1 CI Pipeline (GitHub Actions)
- **On PR:** lint, type-check, unit-test.
- **On Merge (Main):** e2e-test (staging).

### 2.2 Synthetic Monitoring
- **Production:** Run a "Canary" E2E test every hour against production to verify login and read-only paths (non-destructive).

## 3. Risks
- **Flaky E2E Tests:** UI changes often break selectors.
    - *Mitigation:* Use `test-id` attributes (`data-testid`) instead of CSS classes.
- **Test Data Management:** Staging data becomes stale.
    - *Mitigation:* Automated "Seed Script" runs before every E2E suite to reset state.
