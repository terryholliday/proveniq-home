# Frontend Stability Notes

## New Components

### 1. Error Boundaries (`src/components/error-boundary.tsx`)

| Component | Use Case |
|-----------|----------|
| `ErrorBoundary` | Top-level, catches all React errors with full error UI |
| `RouteErrorBoundary` | Page-level, simpler fallback with reload button |
| `SilentErrorBoundary` | Component-level, degrades to empty or custom fallback |

**Integration**: `ErrorBoundary` wraps children in `app-layout.tsx`.

### 2. Data State Utilities (`src/lib/data-state.tsx`)

| Export | Purpose |
|--------|---------|
| `DataState<T>` | Type for loading/error/empty/success states |
| `DataStateRenderer` | Component that renders appropriate UI for each state |
| `withDataState()` | Helper to wrap async operations |

## Patterns Found (For Future Improvement)

| Pattern | Files Affected | Risk |
|---------|----------------|------|
| `key={index}` | 4 files | Medium - can cause issues if list order changes |

Files with `key={index}`:
- `src/app/training/module/[id]/page.tsx`
- `src/components/inventory/item-list.tsx`
- `src/app/page.tsx`
- `src/components/training/Quiz.tsx`

## Recommendations

1. Replace `key={index}` with stable identifiers where items have IDs
2. Use `DataStateRenderer` for new data-fetching components
3. Wrap critical sections with `RouteErrorBoundary`
