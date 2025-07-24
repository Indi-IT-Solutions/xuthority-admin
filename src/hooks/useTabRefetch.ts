import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseTabRefetchOptions {
  queryKey: string | (string | undefined)[];
  refetchFn?: () => void;
  invalidateCache?: boolean;
  delay?: number;
}

/**
 * Custom hook to handle API refetching when tabs or filters change
 * @param activeValue - The current active tab/filter value
 * @param options - Configuration options for refetching
 */
export const useTabRefetch = <T>(
  activeValue: T, 
  options: UseTabRefetchOptions
) => {
  const queryClient = useQueryClient();
  const { queryKey, refetchFn, invalidateCache = true, delay = 50 } = options;
  const previousValue = useRef<T | null>(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Skip the first run to avoid unnecessary API calls on component mount
    if (isFirstRun.current) {
      isFirstRun.current = false;
      previousValue.current = activeValue;
      return;
    }

    // Only refetch if the value actually changed
    if (previousValue.current !== activeValue) {
      const timer = setTimeout(() => {
        // Invalidate cache if requested
        if (invalidateCache) {
          queryClient.invalidateQueries({ 
            queryKey: Array.isArray(queryKey) ? queryKey.filter(Boolean) : [queryKey],
            exact: false 
          });
        }

        // Call refetch function if provided
        if (refetchFn) {
          refetchFn();
        }
      }, delay);

      previousValue.current = activeValue;
      
      return () => clearTimeout(timer);
    }
  }, [activeValue, queryClient, queryKey, refetchFn, invalidateCache, delay]);

  return {
    isTabChanged: previousValue.current !== activeValue && !isFirstRun.current
  };
};

/**
 * Hook specifically for review tab changes
 * @param activeTab - Current active review tab
 * @param slug - User slug for query key
 * @param refetchFn - Function to refetch reviews
 */
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

/**
 * Hook for pagination changes
 * @param currentPage - Current page number
 * @param refetchFn - Function to refetch data
 */
export const usePaginationRefetch = (
  currentPage: number,
  refetchFn: () => void
) => {
  return useTabRefetch(currentPage, {
    queryKey: ['pagination'],
    refetchFn,
    invalidateCache: false,
    delay: 50
  });
};

export default useTabRefetch; 