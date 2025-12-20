# Testing Guide

## Overview

Proveniq Home uses a multi-layer testing strategy:

| Type | Location | Framework | Purpose |
|------|----------|-----------|---------|
| Unit | `__tests__/unit/` | Jest | Core business logic |
| Rules | `__tests__/rules/` | Jest + Firebase Emulator | Firestore security rules |
| API | `__tests__/api/` | Jest | API endpoint validation |
| E2E | `e2e/` | Playwright | Full user flows |

---

## 🚨 TIER 1: LAUNCH BLOCKERS

These tests MUST pass before any public launch.

### Prerequisites

```bash
# 1. Install dependencies (includes @firebase/rules-unit-testing)
npm install

# 2. Seed test users in Firebase Auth
npm run seed:test-users
```

### Running Tier 1 Tests

```bash
# Run ALL Tier 1 tests
npm run test:tier1

# Or run individually:
npm run test:rules      # Firestore security rules
npm run test:api        # API endpoint tests
npm run test:e2e:golden # Golden path (Upload → Analysis → Inventory)
npm run test:e2e:auth   # Authentication flows
```

### Test Descriptions

| Test | File | What It Proves |
|------|------|----------------|
| **Golden Path** | `e2e/golden-path.spec.ts` | Core value proposition works end-to-end |
| **Auth Flow** | `e2e/auth-flow.spec.ts` | Real Firebase auth with session persistence |
| **Firestore Rules** | `__tests__/rules/firestore.rules.test.ts` | Multi-tenant isolation at DB level |
| **API Integration** | `__tests__/api/analyze.test.ts` | Request validation, response format, security |

---

## Test User Credentials

Seeded by `npm run seed:test-users`:

| User | Email | Password | Tenant |
|------|-------|----------|--------|
| User A | test-user-a@proveniq-test.com | TestPassword123! | tenant-a |
| User B | test-user-b@proveniq-test.com | TestPassword123! | tenant-b |
| Admin | test-admin@proveniq-test.com | AdminPassword123! | system |

To cleanup test users:
```bash
npm run seed:test-users:cleanup
```

---

## Running All Tests

```bash
# Unit tests only
npm test

# E2E tests only
npm run test:e2e

# Specific E2E test
npm run test:e2e -- smoke.spec.ts

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## Firestore Rules Testing

Requires Firebase Emulator:

```bash
# Start emulator and run rules tests
npm run test:rules

# Or manually:
firebase emulators:start --only firestore
# In another terminal:
npm test -- __tests__/rules/
```

---

## E2E Test Structure

### Fixtures
- `e2e/fixtures/test-auth.ts` - Authentication helpers and test user credentials

### Key Tests
| File | Coverage |
|------|----------|
| `golden-path.spec.ts` | Upload → AI → Inventory → Valuation |
| `auth-flow.spec.ts` | Login, logout, session, admin access |
| `multi-tenant.spec.ts` | Tenant isolation verification |
| `smoke.spec.ts` | Basic file upload flow |
| `consent.spec.ts` | GDPR consent modal |
| `admin-compliance.spec.ts` | Admin dashboard |

---

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect } from '@jest/globals';

describe('MyFunction', () => {
  it('should handle normal input', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';
import { loginTestUser } from './fixtures/test-auth';

test('user can add item', async ({ page }) => {
  await loginTestUser(page, 'userA');
  await page.goto('/inventory/add');
  // ... test logic
});
```

---

## CI Integration

Tests run automatically on:
- Every push to main
- Every pull request

See `.github/workflows/` for CI configuration.

---

## Current Coverage Status

| Area | Tier 1 Status |
|------|---------------|
| Golden Path E2E | ✅ Implemented |
| Auth Flow E2E | ✅ Implemented |
| Firestore Rules | ✅ Implemented |
| API Integration | ✅ Implemented |
| Multi-Tenant Isolation | ✅ Implemented |
