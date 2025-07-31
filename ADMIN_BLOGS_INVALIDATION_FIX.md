# Admin Blogs Query Invalidation Fix

## Problem
When resources were added or edited, the admin blogs endpoint `http://localhost:8081/api/v1/admin/blogs?page=1&limit=50&sortBy=createdAt&sortOrder=desc` was not being invalidated, causing the ResourceCenterPage to show stale data.

## Solution
Added comprehensive query invalidation for admin blogs queries in all blog mutation hooks to ensure fresh data is fetched after create, update, and delete operations.

## Changes Made

### 1. Updated useCreateBlog Hook
**File:** `src/hooks/useBlog.ts`
```typescript
onSuccess: (response) => {
  // Invalidate blogs queries to refetch data
  queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.blogs });
  // Invalidate admin blogs queries
  queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
  queryClient.invalidateQueries({ queryKey: ['admin-blogs-with-fallback'] });
  
  // Show success toast
  toast.success('Resource created successfully!');
  
  return response.data;
},
```

### 2. Updated useUpdateBlog Hook
```typescript
onSuccess: (response, { id }) => {
  // Invalidate blogs queries
  queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.blogs });
  // Invalidate specific blog query
  queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.blog(id) });
  // Invalidate admin blogs queries
  queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
  queryClient.invalidateQueries({ queryKey: ['admin-blogs-with-fallback'] });
  
  // Show success toast
  toast.success('Resource updated successfully!');
  
  return response.data;
},
```

### 3. Updated useDeleteBlog Hook
```typescript
onSuccess: () => {
  // Invalidate blogs queries to refetch data
  queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.blogs });
  // Invalidate admin blogs queries
  queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
  queryClient.invalidateQueries({ queryKey: ['admin-blogs-with-fallback'] });
  
  // Show success toast
  toast.success('Resource deleted successfully!');
},
```

### 4. Fixed Deprecated keepPreviousData
```typescript
// Removed deprecated keepPreviousData option
return useQuery({
  queryKey: [...BLOG_QUERY_KEYS.blogs, params],
  queryFn: () => BlogService.getBlogs(params),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## Query Keys Invalidated

The following query keys are now invalidated on all blog mutations:

1. **`['blogs']`** - General blogs queries
2. **`['admin-blogs']`** - Admin-specific blogs queries
3. **`['admin-blogs-with-fallback']`** - Admin blogs with fallback queries
4. **`['blogs', id]`** - Specific blog queries (for updates)

## Benefits

1. **Fresh Data**: ResourceCenterPage now shows updated data immediately after create/edit/delete operations
2. **Consistent State**: All admin views reflect the latest changes
3. **Better UX**: Users see changes without manual refresh
4. **Comprehensive Coverage**: All relevant query keys are invalidated

## Operations Covered

- ✅ **Create Resource**: Invalidates all admin blogs queries
- ✅ **Update Resource**: Invalidates all admin blogs queries + specific blog
- ✅ **Delete Resource**: Invalidates all admin blogs queries
- ✅ **Edit Resource Page**: Already had proper invalidation

## Testing
- ✅ Build completed successfully
- ✅ No TypeScript compilation errors
- ✅ All mutation hooks updated
- ✅ Deprecated options removed

## Impact
- **Positive**: ResourceCenterPage now shows fresh data after mutations
- **Improvement**: Better data consistency across admin views
- **Fix**: Resolves stale data issues in resource management 