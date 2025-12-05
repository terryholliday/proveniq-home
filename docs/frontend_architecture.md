# Frontend Architecture & Risk Assessment (Phase 3)

**Status:** Living Document  
**Owner:** Frontend Specialist  
**Last Updated:** 2025-05-01

## 1. System Overview

MyARK's frontend is a **Next.js 14+** application using the **App Router**, **TypeScript**, and **Tailwind CSS**.

### 1.1 Core Stack
- **Framework:** Next.js (Server Components + Client Components).
- **Styling:** Tailwind CSS + `shadcn/ui` (Radix Primitives).
- **State Management:**
    - Server State: `React Query` (TanStack Query) via `trpc` or direct fetch.
    - Local State: React `useState` / `useReducer`.
    - Global UI State: React Context (e.g., `ToastProvider`, `ThemeProvider`).

### 1.2 Performance & Vitals
- **Core Web Vitals:** Optimized for LCP (Largest Contentful Paint) via Next.js Image component and server-side streaming.
- **Bundle Size:** We monitor heavy dependencies (e.g., charting libraries, map SDKs) to ensure they are lazy-loaded.

## 2. Key Directories

- `src/app`: Page routes and layouts.
- `src/components/ui`: Reusable atomic components (Buttons, Cards, Inputs).
- `src/components/inventory`: Feature-specific domain components.
- `src/hooks`: Custom React hooks (e.g., `useIsMobile`, `useValuation`).
- `src/lib`: Utilities, formatting, and API clients.

## 3. Risks & Technical Debt

### 3.1 Component Coupling
- Some feature components (e.g., `ItemCard`) act as "God Components," handling too much logic (fetching + display + routing).
- **Mitigation:** Refactor into `Container/Presenter` pattern or extract logic to custom hooks.

### 3.2 Accessibility (a11y)
- While `shadcn/ui` provides good defaults, custom flows (like the "Legacy Planner") need manual keyboard navigation and screen reader testing.

### 3.3 Theme Consistency
- Hardcoded hex values occasionally slip into `tailwind.config` or inline styles. We must enforce usage of CSS variables (`var(--primary)`) for Dark Mode compatibility.
