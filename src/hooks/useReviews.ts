import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReviewService, ReviewQueryParams, ReviewsApiResponse } from '@/services/reviewService';
import toast from 'react-hot-toast';

// Query keys for caching
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (params: ReviewQueryParams) => [...reviewKeys.lists(), params] as const,
  detail: (id: string) => [...reviewKeys.all, 'detail', id] as const,
  stats: () => [...reviewKeys.all, 'stats'] as const,
};

/**
 * Hook for fetching reviews with pagination, search, and filtering
 */
export const useReviews = (params: ReviewQueryParams = {}) => {
  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: async () => {
      const response = await ReviewService.getReviews(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch reviews');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    retry: false, // Disable retries to prevent duplicate toast notifications
  });
};

/**
 * Hook for fetching all reviews for admin (handles "all" status by combining multiple requests)
 */
export const useAdminReviews = (params: ReviewQueryParams = {}) => {
  return useQuery({
    queryKey: [...reviewKeys.list(params), 'admin'],
    queryFn: async () => {
      // Exclude timestamp from API call but keep other params
      const apiParams = { ...params } as any;
      console.log('apiParams', apiParams)
      const response = await ReviewService.getAllReviewsForAdmin(apiParams);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch reviews');
      }
      return response.data;
    },
    staleTime: 0, // Don't use stale data to ensure fresh fetches
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};

/**
 * Hook for getting a specific review by ID
 */
export const useReview = (reviewId: string, enabled = true) => {
  return useQuery({
    queryKey: reviewKeys.detail(reviewId),
    queryFn: async () => {
      const response = await ReviewService.getReviewById(reviewId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch review');
      }
      return response.data;
    },
    enabled: !!reviewId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Disable retries to prevent duplicate toast notifications
  });
};

/**
 * Hook for getting review statistics
 */
export const useReviewStats = () => {
  return useQuery({
    queryKey: reviewKeys.stats(),
    queryFn: async () => {
      const response = await ReviewService.getReviewStats();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch review stats');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Disable retries to prevent duplicate toast notifications
  });
};

/**
 * Hook for approving a review
 */
export const useApproveReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await ReviewService.approveReview(reviewId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to approve review');
      }
      return response.data;
    },
    onSuccess: (data, reviewId) => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(reviewId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
      
      toast.success('Review approved successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to approve review';
      toast.error(errorMessage);
      console.error('Approve review error:', error);
    },
  });
};

/**
 * Hook for rejecting a review
 */
export const useRejectReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await ReviewService.rejectReview(reviewId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to reject review');
      }
      return response.data;
    },
    onSuccess: (data, reviewId) => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(reviewId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
      
      toast.success('Review rejected successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to reject review';
      toast.error(errorMessage);
      console.error('Reject review error:', error);
    },
  });
};

/**
 * Hook for deleting a review
 */
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await ReviewService.deleteReview(reviewId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete review');
      }
      return response.data;
    },
    onSuccess: (data, reviewId) => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(reviewId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
      
      toast.success('Review deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete review';
      toast.error(errorMessage);
      console.error('Delete review error:', error);
    },
  });
};

/**
 * Hook for resolving a disputed review
 */
export const useResolveDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await ReviewService.resolveDispute(reviewId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to resolve dispute');
      }
      return response.data;
    },
    onSuccess: (data, reviewId) => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(reviewId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
      
      toast.success('Dispute resolved successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to resolve dispute';
      toast.error(errorMessage);
      console.error('Resolve dispute error:', error);
    },
  });
};

/**
 * Hook for bulk deleting reviews
 */
export const useBulkDeleteReviews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewIds: string[]) => {
      const response = await ReviewService.bulkDeleteReviews(reviewIds);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete reviews');
      }
      return response.data;
    },
    onSuccess: (data, reviewIds) => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
      
      const count = reviewIds.length;
      toast.success(`${count} review${count > 1 ? 's' : ''} deleted successfully`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete reviews';
      toast.error(errorMessage);
      console.error('Bulk delete reviews error:', error);
    },
  });
}; 