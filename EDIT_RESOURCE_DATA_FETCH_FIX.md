# Edit Resource Data Fetch Fix

## Problem
The EditResourcePage was not fetching the latest data when editing a resource. The form was showing stale data instead of the most recent content type and other fields.

## Root Cause
1. **Insufficient Query Invalidation**: The update mutation was not invalidating all relevant queries
2. **Cached Data**: The resource query was using cached data instead of fetching fresh data
3. **No Refetch on Mount**: The component wasn't refetching data when it mounted

## Solution
Enhanced the data fetching and invalidation mechanisms to ensure the latest data is always loaded.

## Changes Made

### 1. Enhanced Query Invalidation
**File:** `src/pages/admin/EditResourcePage.tsx`
```typescript
onSuccess: () => {
  toast.dismiss();
  toast.success('Resource updated successfully');
  // Invalidate all relevant queries
  queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
  queryClient.invalidateQueries({ queryKey: ['admin-blogs-with-fallback'] });
  queryClient.invalidateQueries({ queryKey: ['resource', id] });
  queryClient.invalidateQueries({ queryKey: ['blogs'] });
  navigate('/resource-center');
},
```

### 2. Improved Resource Query Configuration
```typescript
const { data: resourceData, isLoading: isLoadingResource, error: resourceError, refetch } = useQuery({
  queryKey: ['resource', id],
  queryFn: async () => {
    if (!id) throw new Error('Resource ID is required');
    const response = await BlogService.getBlogById(id);
    return response.data;
  },
  enabled: !!id,
  staleTime: 0, // Always fetch fresh data
  refetchOnWindowFocus: true, // Refetch when window gains focus
});
```

### 3. Added Manual Refetch on Mount
```typescript
// Refetch data when component mounts to ensure latest data
useEffect(() => {
  if (id) {
    refetch();
  }
}, [id, refetch]);
```

### 4. Added Debug Logging
```typescript
// Debug: Log the data being loaded
console.log('Resource Data:', resourceData);
console.log('Form Reset Data:', resetData);
```

## Benefits

1. **Fresh Data**: Always fetches the latest resource data when editing
2. **Comprehensive Invalidation**: Invalidates all relevant queries after updates
3. **Real-time Updates**: Refetches data when window gains focus
4. **Debug Visibility**: Added logging to track data loading issues
5. **Better UX**: Users see the most recent data in the edit form

## Query Keys Invalidated

The following query keys are now invalidated after resource updates:

1. **`['admin-blogs']`** - Admin blogs list queries
2. **`['admin-blogs-with-fallback']`** - Admin blogs with fallback queries
3. **`['resource', id]`** - Specific resource query
4. **`['blogs']`** - General blogs queries

## Query Configuration Improvements

- **`staleTime: 0`** - Always fetch fresh data instead of using cached data
- **`refetchOnWindowFocus: true`** - Refetch when user returns to the tab
- **`refetch()` on mount** - Manual refetch when component loads

## Testing
- ✅ Build completed successfully
- ✅ No TypeScript compilation errors
- ✅ Enhanced query invalidation
- ✅ Added debug logging for troubleshooting

## Impact
- **Positive**: Edit form now shows the latest data
- **Improvement**: Better data consistency across the application
- **Fix**: Resolves stale data issues in resource editing
- **Debug**: Added logging to help identify data loading issues 