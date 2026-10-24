# Validation Report - Performance & Offline Improvements

## Issues Found & Fixed

### ❌ Issue #1: React Query Invalid Options

**Problem**: Used `throwOnError: true` - NOT valid in React Query v5  
**Fixed**: Removed from queries and mutations in `src/router.tsx`

### ⚠️ Issue #2: Mutation Retry Risk

**Problem**: Enabled `retry: 1` on mutations - creates, toggles, saves are NOT idempotent  
**Risk**: Timeout after server commits → duplicate writes  
**Fixed**: Set `retry: false` for all mutations in `src/router.tsx`

### ⚠️ Issue #3: Signal Conflict

**Problem**: Timeout AbortController could override React Query's cancellation signal  
**Fixed**: Added signal merging logic in `src/integrations/supabase/client.ts`

### ❌ Issue #4: Service Worker Event

**Problem**: `controllerchange` listener in SW (should be page-side only)  
**Fixed**: Removed from `public/sw.js`

### 🧹 Issue #5: Unused Imports

**Fixed**: Removed `useMutation` and `useOnlineStatus` from wrong files

## Files Changed

**Created (3):**

- `src/hooks/use-online-status.ts`
- `src/components/Skeleton.tsx`
- `src/components/OfflineIndicator.tsx`

**Modified (8):**

- `src/router.tsx` - Query config fixes
- `src/integrations/supabase/client.ts` - Timeout + signal merging
- `src/routes/__root.tsx` - SW registration + OfflineIndicator
- `src/routes/index.tsx` - Skeleton loaders
- `src/components/AuthCard.tsx` - Offline controls
- `src/components/TrackerBoard.tsx` - Offline controls
- `src/components/MobileTrackerView.tsx` - Offline controls
- `public/sw.js` - Enhanced cache management

## Validation Commands

```bash
# 1. Type check
cd C:\lucky\day-by-day && npx tsc --noEmit

# 2. Lint
cd C:\lucky\day-by-day && npx eslint . --ext .ts,.tsx

# 3. Build
cd C:\lucky\day-by-day && npm run build

# 4. Preview
cd C:\lucky\day-by-day && npm run preview
```

## Critical Testing Scenarios

### Must Test Offline Behavior

1. **Load offline**: Enable DevTools offline mode → refresh → verify cached shell loads
2. **Go offline**: Load online → enable offline mode → verify banner + disabled controls
3. **Reconnect**: Disable offline mode → verify banner disappears + controls enabled

### Must Verify Timeout

1. **Slow network**: Throttle to "Slow 3G" → toggle check → verify 15s timeout
2. **No duplicate**: Verify mutation NOT retried after timeout

## Final Configuration

```typescript
// React Query
queries: { staleTime: 5min, retry: 3, refetchOnWindowFocus: false }
mutations: { retry: false }  // ← CRITICAL: prevents duplicates

// Supabase
timeout: 15 seconds (with signal merging)

// Service Worker
version: day-by-day-v4
precache: manifest + icons only (JS/CSS cached on demand)
```

## Preserved Features

✅ Desktop layout  
✅ Android TWA fullscreen  
✅ Theme initialization  
✅ Authentication  
✅ Habit tracking

## Android TWA

❌ **No APK rebuild needed** - changes are web assets only

## Status

✅ All code issues fixed  
⚠️ Requires manual testing (especially offline scenarios)
