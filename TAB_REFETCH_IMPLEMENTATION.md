# Tab Refetch Implementation

This document explains the implementation of automatic API refetching when tabs change in the UserDetailPage component.

## Problem

Previously, when users changed review tabs (All, Approved, Pending, Disputed) in the UserDetailPage, the API wasn't being called again to fetch the filtered reviews. This caused the UI to show stale data instead of the correct filtered results.

## Solution

### 1. Custom Hook: `useTabRefetch`

Created a reusable utility hook (`src/hooks/useTabRefetch.ts`) that handles API refetching when tab values change:

```typescript
export const useTabRefetch = <T>(
  activeValue: T, 
  options: UseTabRefetchOptions
) => {
  // Automatically detects when activeValue changes
  // Invalidates query cache
  // Triggers refetch with configurable delay
}
```

**Key Features:**
- ✅ Detects when tab values actually change
- ✅ Skips unnecessary API calls on component mount
- ✅ Configurable delay for refetch timing
- ✅ Optional cache invalidation
- ✅ TypeScript support for any value type

### 2. Specialized Hook: `useReviewTabRefetch`

A specialized version for review tab changes:

```typescript
export const useReviewTabRefetch = (
  activeTab: string,
  slug: string | undefined,
  refetchFn: () => void
) => {
  return useTabRefetch(activeTab, {
    queryKey: ['userReviews', slug],
    refetchFn,
    invalidateCache: true,
    delay: 100
  });
};
```

### 3. Implementation in UserDetailPage

Updated the `UserDetailPage.tsx` component to use the new hook:

```typescript
// Use the utility hook to handle tab changes and API refetching
const { isTabChanged } = useReviewTabRefetch(activeReviewTab, slug, refetchReviews);

const handleReviewTabChange = (tab: 'all' | 'approved' | 'pending' | 'disputed') => {
  setActiveReviewTab(tab);
  setCurrentReviewsPage(1);
  setReviewsRefetchTrigger(Date.now());
  
  // The useReviewTabRefetch hook will automatically handle the API refetch
  // when activeReviewTab changes, ensuring fresh data is loaded
};
```

## Benefits

### 🚀 Automatic API Calls
- **Before**: Manual tab changes didn't trigger API calls
- **After**: Every tab change automatically refetches data with the correct filter

### 🎯 Smart Detection
- Only triggers API calls when tab actually changes
- Skips unnecessary calls on component mount
- Prevents duplicate API requests

### 🔄 Cache Management
- Automatically invalidates relevant query cache
- Ensures fresh data is fetched from server
- Maintains React Query optimization

### 💫 Better UX
- Shows loading state during tab transitions
- Clear visual feedback when data is being fetched
- Responsive interface during API calls

### 🛠️ Reusable Solution
- Can be used for any tab/filter scenario
- Configurable for different use cases
- TypeScript support for type safety

## Technical Flow

1. **User clicks tab** → `handleReviewTabChange()` called
2. **State updates** → `activeReviewTab` changes
3. **Hook detects change** → `useReviewTabRefetch` triggered
4. **Cache invalidation** → Old data cleared from React Query cache
5. **API refetch** → New API call with updated filter
6. **UI updates** → Fresh data displayed with loading states

## Usage Examples

### Basic Tab Refetch
```typescript
const { isTabChanged } = useTabRefetch(activeFilter, {
  queryKey: ['data', id],
  refetchFn: refetchData,
  delay: 100
});
```

### Review-Specific Usage
```typescript
const { isTabChanged } = useReviewTabRefetch(
  activeReviewTab, 
  userSlug, 
  refetchReviews
);
```

### With Loading States
```typescript
{(isLoading || isTabChanged) ? (
  <EnhancedLoader 
    loadingText={isTabChanged ? "Loading filtered data..." : "Loading..."} 
  />
) : (
  // Render data
)}
```

## Files Modified

1. **`src/hooks/useTabRefetch.ts`** - New utility hook
2. **`src/pages/admin/UserDetailPage.tsx`** - Updated to use the hook
3. **`TAB_REFETCH_IMPLEMENTATION.md`** - This documentation

## Configuration Options

```typescript
interface UseTabRefetchOptions {
  queryKey: string | (string | undefined)[];  // React Query cache key
  refetchFn?: () => void;                     // Function to call for refetch
  invalidateCache?: boolean;                  // Whether to clear cache (default: true)
  delay?: number;                            // Delay before refetch (default: 50ms)
}
```

## Future Enhancements

- [ ] Add debouncing for rapid tab changes
- [ ] Implement retry logic for failed refetches
- [ ] Add analytics tracking for tab usage
- [ ] Create variants for different data types
- [ ] Add prefetching for commonly accessed tabs

## Testing

### Manual Testing Steps

1. **Navigate to User Detail page**
2. **Click different review tabs** (All → Approved → Pending → Disputed)
3. **Verify API calls** in Network tab
4. **Confirm data updates** in UI
5. **Check loading states** during transitions

### Expected Behavior

- ✅ Each tab change triggers new API call
- ✅ Loading spinner shows during refetch
- ✅ Correct filtered data displays
- ✅ No unnecessary API calls on mount
- ✅ Smooth transitions between tabs

## Performance Considerations

- **Minimal delay** (100ms) to balance UX and performance
- **Cache invalidation** ensures fresh data without over-fetching
- **Smart detection** prevents duplicate API calls
- **React Query optimization** maintains efficient caching

This implementation ensures that users always see the most up-to-date, correctly filtered review data when switching between tabs. 