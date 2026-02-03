# Scorer App - Performance Optimization Audit & Plan

## Executive Summary

This document outlines a comprehensive optimization plan to make the scorer app lightweight, fast, reliable, and scalable. The audit identified **25+ critical issues** across performance, code quality, reliability, and scalability.

**Current State:**
- Large monolithic components (1437+ lines)
- 30+ console.log statements in production
- Missing memoization and code splitting
- No error boundaries
- Potential memory leaks
- Race conditions in API calls
- No request cancellation
- Missing edge case handling

**Target State:**
- <100KB initial bundle size
- <100ms time to interactive
- Zero console logs in production
- Comprehensive error handling
- Full edge case coverage
- Scalable architecture

---

## Phase 1: Critical Performance Fixes (Week 1)
**Priority: 🔴 CRITICAL | Impact: High | Effort: Medium**

### 1.1 Remove Production Console Logs
**Issue:** 30+ console.log/error statements in production code
**Impact:** Performance degradation, security risk, bundle size
**Fix:**
- Create logger utility with environment-based logging
- Replace all console.* with logger
- Add build-time removal of logs in production

**Files:**
- `src/app/matches/[matchId]/score/page.tsx` (13 instances)
- `src/app/dashboard/page.tsx`
- `src/components/scoring/*.tsx` (multiple files)
- `src/lib/socket.ts`

**Estimated Impact:** -5KB bundle, +2% performance

---

### 1.2 Component Memoization
**Issue:** Unnecessary re-renders of expensive components
**Impact:** UI lag, battery drain, poor UX
**Fix:**
- Add `React.memo` to all card components
- Memoize expensive calculations with `useMemo`
- Memoize callbacks with `useCallback` (already partially done)

**Components to Memoize:**
- `CurrentBattersCard`
- `CurrentBowlerCard`
- `PartnershipCard`
- `RunRateCard`
- `LiveScoringInterface`
- All modal components

**Estimated Impact:** -40% unnecessary re-renders, +15% performance

---

### 1.3 Code Splitting & Lazy Loading
**Issue:** All modals loaded upfront, large initial bundle
**Impact:** Slow initial load, poor FCP/LCP metrics
**Fix:**
- Lazy load all modals with `React.lazy()`
- Split routes with dynamic imports
- Code split heavy utilities

**Components to Lazy Load:**
```typescript
const WicketPopup = lazy(() => import('@/components/scoring/WicketPopup'));
const ManualScoreModal = lazy(() => import('@/components/scoring/ManualScoreModal'));
// ... all other modals
```

**Estimated Impact:** -30KB initial bundle, +25% faster load

---

### 1.4 Optimize Large Components
**Issue:** `score/page.tsx` is 1437 lines, too many responsibilities
**Impact:** Hard to maintain, performance issues, memory leaks
**Fix:**
- Extract custom hooks for match state management
- Split into smaller components
- Extract API logic to custom hooks

**Refactoring Plan:**
```
score/page.tsx (1437 lines)
├── hooks/
│   ├── useMatchState.ts (state management)
│   ├── useMatchAPI.ts (API calls)
│   ├── useBallRecording.ts (ball recording logic)
│   └── useMatchModals.ts (modal state)
├── components/
│   ├── MatchScoreHeader.tsx
│   ├── MatchStatsPanel.tsx
│   └── ScoringControls.tsx
└── page.tsx (<300 lines)
```

**Estimated Impact:** -50% component complexity, +20% performance

---

## Phase 2: State Management & Data Flow (Week 2)
**Priority: 🟠 HIGH | Impact: High | Effort: High**

### 2.1 Consolidate State Management
**Issue:** 20+ useState hooks in single component, potential race conditions
**Impact:** State inconsistencies, bugs, performance issues
**Fix:**
- Create unified match state reducer with `useReducer`
- Consolidate related state into objects
- Add state validation

**Current State:**
```typescript
const [match, setMatch] = useState<CricketMatch | null>(null);
const [currentInnings, setCurrentInnings] = useState(1);
const [battingTeam, setBattingTeam] = useState<'home' | 'away'>('home');
// ... 15+ more useState hooks
```

**Proposed:**
```typescript
type MatchState = {
  match: CricketMatch | null;
  liveState: {
    innings: number;
    battingTeam: 'home' | 'away';
    strikerId: string;
    // ...
  };
  ui: {
    loading: boolean;
    syncStatus: 'synced' | 'syncing' | 'error';
    modals: { /* modal states */ };
  };
};

const [state, dispatch] = useReducer(matchReducer, initialState);
```

**Estimated Impact:** -30% state complexity, +10% performance, better reliability

---

### 2.2 API Request Optimization
**Issue:** No request cancellation, race conditions, no retry logic
**Impact:** Memory leaks, incorrect data, poor UX
**Fix:**
- Add AbortController for request cancellation
- Implement request deduplication
- Add exponential backoff retry logic
- Add request queue for sequential operations

**Implementation:**
```typescript
// Request cancellation
const abortController = useRef<AbortController>();

useEffect(() => {
  return () => {
    abortController.current?.abort();
  };
}, []);

// Request deduplication
const pendingRequests = useRef<Map<string, Promise<any>>>(new Map());

// Retry logic
async function apiCallWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
}
```

**Estimated Impact:** -50% race conditions, +30% reliability

---

### 2.3 Optimistic Updates Optimization
**Issue:** Optimistic updates may conflict with server state
**Impact:** Data inconsistencies, UI bugs
**Fix:**
- Add version/timestamp tracking
- Implement rollback on conflict
- Add conflict resolution strategy

**Estimated Impact:** +40% data consistency

---

## Phase 3: Error Handling & Edge Cases (Week 3)
**Priority: 🟠 HIGH | Impact: High | Effort: Medium**

### 3.1 Error Boundaries
**Issue:** No error boundaries, crashes affect entire app
**Impact:** Poor UX, app crashes, data loss
**Fix:**
- Add error boundaries at route level
- Add error boundaries for critical sections
- Implement error recovery UI

**Implementation:**
```typescript
// app/error.tsx
'use client';
export default function Error({ error, reset }) {
  return <ErrorBoundary error={error} reset={reset} />;
}

// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  // Implementation
}
```

**Estimated Impact:** +90% error recovery, better UX

---

### 3.2 Comprehensive Edge Case Handling
**Issue:** Missing validation and edge case handling
**Impact:** Crashes, data corruption, poor UX
**Fix:**
- Add input validation for all forms
- Handle network failures gracefully
- Handle concurrent user actions
- Handle rapid button clicks
- Handle browser back/forward navigation
- Handle page refresh during scoring
- Handle offline scenarios

**Edge Cases to Handle:**
1. **Network Issues:**
   - Offline detection
   - Request timeout handling
   - Partial data loading
   - Connection recovery

2. **User Actions:**
   - Rapid button clicks (debounce)
   - Browser navigation during scoring
   - Page refresh with unsaved data
   - Multiple tabs open

3. **Data Validation:**
   - Invalid match state
   - Missing required fields
   - Out-of-range values
   - Type mismatches

4. **Race Conditions:**
   - Concurrent API calls
   - State updates during navigation
   - Modal open/close conflicts

**Estimated Impact:** +80% reliability, -90% crashes

---

### 3.3 Loading States & Skeleton Screens
**Issue:** Missing or poor loading states
**Impact:** Poor UX, perceived slowness
**Fix:**
- Add skeleton screens for all loading states
- Add progressive loading
- Add loading indicators for async operations

**Estimated Impact:** +50% perceived performance

---

## Phase 4: Bundle Size & Asset Optimization (Week 4)
**Priority: 🟡 MEDIUM | Impact: Medium | Effort: Low**

### 4.1 Bundle Analysis & Optimization
**Issue:** Unknown bundle size, potential bloat
**Impact:** Slow load times, poor mobile performance
**Fix:**
- Add bundle analyzer
- Remove unused dependencies
- Tree-shake unused code
- Optimize imports

**Dependencies to Review:**
- `date-fns` - Use only needed functions
- `lucide-react` - Tree-shake icons
- `axios` - Consider lighter alternative
- `socket.io-client` - Lazy load

**Estimated Impact:** -20KB bundle, +15% load speed

---

### 4.2 Image & Asset Optimization
**Issue:** No asset optimization strategy
**Impact:** Slow load times
**Fix:**
- Optimize images (if any)
- Add WebP support
- Lazy load images
- Use Next.js Image component

**Estimated Impact:** +10% load speed

---

### 4.3 Font Optimization
**Issue:** Font loading not optimized
**Impact:** Layout shift, slow rendering
**Fix:**
- Preload critical fonts
- Use font-display: swap
- Subset fonts if possible

**Estimated Impact:** +5% FCP improvement

---

## Phase 5: Caching & Performance (Week 5)
**Priority: 🟡 MEDIUM | Impact: Medium | Effort: Medium**

### 5.1 API Response Caching
**Issue:** No caching strategy, redundant API calls
**Impact:** Slow performance, unnecessary bandwidth
**Fix:**
- Implement React Query or SWR for caching
- Add stale-while-revalidate strategy
- Cache match data with TTL
- Cache user profile

**Implementation:**
```typescript
// Using SWR
import useSWR from 'swr';

function useMatch(matchId: string) {
  const { data, error, mutate } = useSWR(
    matchId ? `/api/matches/${matchId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );
  return { match: data, loading: !error && !data, error, refresh: mutate };
}
```

**Estimated Impact:** -60% redundant API calls, +30% performance

---

### 5.2 Local Storage Optimization
**Issue:** Frequent localStorage access, no validation
**Impact:** Performance degradation, potential errors
**Fix:**
- Cache localStorage reads
- Add validation for stored data
- Implement storage quota management
- Add storage error handling

**Estimated Impact:** +10% performance

---

### 5.3 Debouncing & Throttling
**Issue:** Missing debounce/throttle for user actions
**Impact:** Performance issues, API spam
**Fix:**
- Debounce search inputs
- Throttle scroll events
- Debounce rapid button clicks
- Throttle API calls

**Estimated Impact:** -40% unnecessary operations

---

## Phase 6: Scalability & Architecture (Week 6)
**Priority: 🟢 LOW | Impact: Low | Effort: High**

### 6.1 Service Worker & Offline Support
**Issue:** No offline support, poor mobile experience
**Impact:** Poor UX on poor connections
**Fix:**
- Add service worker
- Implement offline queue (simpler than before)
- Cache critical assets
- Add offline indicator

**Estimated Impact:** +80% offline capability

---

### 6.2 WebSocket Optimization
**Issue:** WebSocket not implemented, potential for real-time updates
**Impact:** Missing real-time features
**Fix:**
- Implement WebSocket for live updates
- Add reconnection logic
- Handle connection state
- Optimize message handling

**Estimated Impact:** Real-time updates, better UX

---

### 6.3 Type Safety Improvements
**Issue:** Many `@ts-ignore` comments, type safety issues
**Impact:** Runtime errors, maintenance issues
**Fix:**
- Fix all TypeScript errors
- Remove `@ts-ignore` comments
- Add proper type definitions
- Enable strict mode

**Files with @ts-ignore:**
- `src/app/matches/[matchId]/score/page.tsx` (multiple)

**Estimated Impact:** +50% type safety, -30% runtime errors

---

## Phase 7: Testing & Monitoring (Week 7)
**Priority: 🟢 LOW | Impact: Medium | Effort: High**

### 7.1 Performance Monitoring
**Issue:** No performance monitoring
**Impact:** Unknown performance issues
**Fix:**
- Add Web Vitals tracking
- Add custom performance metrics
- Monitor API response times
- Track error rates

**Estimated Impact:** Visibility into performance

---

### 7.2 Error Tracking
**Issue:** No error tracking system
**Impact:** Unknown errors, poor debugging
**Fix:**
- Integrate error tracking (Sentry, LogRocket)
- Track error frequency
- Add error context
- Monitor error trends

**Estimated Impact:** +90% error visibility

---

## Implementation Priority Matrix

| Phase | Priority | Impact | Effort | ROI | Week |
|-------|----------|--------|--------|-----|------|
| Phase 1 | 🔴 Critical | High | Medium | ⭐⭐⭐⭐⭐ | 1 |
| Phase 2 | 🟠 High | High | High | ⭐⭐⭐⭐ | 2 |
| Phase 3 | 🟠 High | High | Medium | ⭐⭐⭐⭐⭐ | 3 |
| Phase 4 | 🟡 Medium | Medium | Low | ⭐⭐⭐ | 4 |
| Phase 5 | 🟡 Medium | Medium | Medium | ⭐⭐⭐⭐ | 5 |
| Phase 6 | 🟢 Low | Low | High | ⭐⭐ | 6 |
| Phase 7 | 🟢 Low | Medium | High | ⭐⭐⭐ | 7 |

---

## Success Metrics

### Performance Targets
- **Initial Bundle Size:** <100KB (gzipped)
- **Time to Interactive:** <2s
- **First Contentful Paint:** <1s
- **Largest Contentful Paint:** <2.5s
- **Cumulative Layout Shift:** <0.1

### Reliability Targets
- **Error Rate:** <0.1%
- **API Success Rate:** >99.5%
- **Uptime:** >99.9%
- **Data Consistency:** 100%

### Code Quality Targets
- **TypeScript Coverage:** 100%
- **Console Logs in Production:** 0
- **@ts-ignore Comments:** 0
- **Component Size:** <300 lines
- **Test Coverage:** >80%

---

## Quick Wins (Can be done immediately)

1. ✅ Remove console.log statements (1 hour)
2. ✅ Add React.memo to card components (2 hours)
3. ✅ Lazy load modals (2 hours)
4. ✅ Add error boundaries (3 hours)
5. ✅ Add request cancellation (2 hours)

**Total Quick Wins Time:** ~10 hours
**Estimated Impact:** +30% performance improvement

---

## Notes

- Each phase should be tested thoroughly before moving to next
- Performance metrics should be measured before/after each phase
- Code reviews required for all changes
- Maintain backward compatibility where possible
- Document all optimizations

---

## Next Steps

1. Review and approve this plan
2. Set up performance monitoring baseline
3. Start with Phase 1 (Quick Wins)
4. Measure and iterate

