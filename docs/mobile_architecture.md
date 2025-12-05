# Mobile Architecture & Experience Strategy (Phase 3)

**Status:** Living Document  
**Owner:** Mobile Experience Architect  
**Last Updated:** 2025-05-01

## 1. Mobile-First Philosophy
MyARK is designed to be used "in the field" (attics, storage units, estate sales). Therefore, mobile performance and usability are paramount, not afterthoughts.

## 2. Technical Stack

### 2.1 Responsive Design
- **Breakpoints:** Tailwind compliant (`sm: 640px`, `md: 768px`, `lg: 1024px`).
- **Hook:** `useIsMobile()` (wrapping `window.matchMedia`) differentiates logic for `< 768px`.
- **Touch Targets:** All interactive elements must have a minimum hit area of 44x44px.

### 2.2 PWA (Progressive Web App)
- **Manifest:** Configured for "standalone" display to remove browser chrome.
- **Service Worker:** Caches app shell (JS/CSS) and critical assets for offline launch.
- **Installability:** "Add to Home Screen" prompted after successful "Critical User Journey" (e.g., adding first item).

## 3. Key Mobile Flows

### 3.1 Inventory Capture
- **Camera Access:** Direct integration with `<input type="file" capture="environment">` for low-friction photo taking.
- **Optimistic UI:** Photos appear immediately in the gallery while uploading in the background.

### 3.2 Offline Mode (Planned Phase 4)
- **Local Database:** RxDB or simplified Firestore offline persistence.
- **Sync Engine:** Queues mutations (`addItem`, `updateValuation`) and replays them when back online.

## 4. Risks & Mitigations
- **Network Flakiness:** Estate sales often have poor signal.
    - *Mitigation:* Aggressive caching of viewed items; "Retry" buttons for failed API calls.
- **Battery Usage:** Heavy AI processing on-device.
    - *Mitigation:* Offload heavier tasks (Visual Truth hashing) to web workers or postpone until charging.
