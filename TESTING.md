# Testing Guide

## Overview

MyARK uses Jest for testing. Tests are organized by type:

| Type | Location | Purpose |
|------|----------|---------|
| Unit | `__tests__/unit/` | Core business logic |
| Integration | `__tests__/integration/` | Service interactions |
| E2E | `__tests__/e2e/` | Full user flows |

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/file.test.ts

# Run in watch mode
npm test -- --watch
```

## Test Structure

### Unit Tests
Test pure functions and utilities:
- Data transformations
- Validation logic
- Type guards

### Integration Tests
Test service interactions:
- Firestore operations
- AI flow execution
- API endpoint handlers

### E2E Smoke Test
Critical user flow:
1. User signup
2. Add first item
3. View dashboard
4. Verify item appears

## Writing Tests

```typescript
import { describe, it, expect } from '@jest/globals';

describe('MyFunction', () => {
  it('should handle normal input', () => {
    expect(myFunction('input')).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

## Current Coverage

| Area | Status |
|------|--------|
| Error boundaries | ✅ Component exists |
| Data state utilities | ✅ Utilities exist |
| AI stability | ✅ Wrapper exists |
| Logger | ✅ Module exists |

## CI Integration

Tests run automatically on:
- Every push to main
- Every pull request

See `.github/workflows/` for CI configuration.
