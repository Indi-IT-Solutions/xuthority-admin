import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DisputeService, DisputeQueryParams, DisputesApiResponse, RawDisputeData } from '@/services/disputeService';
import { reviewKeys } from '@/hooks/useReviews';
import toast from 'react-hot-toast';

// Query keys for caching
export const disputeKeys = {
  all: ['disputes'] as const,
  lists: () => [...disputeKeys.all, 'list'] as const,
  list: (params: DisputeQueryParams) => [...disputeKeys.lists(), params] as const,
  byReview: (reviewId: string) => [...disputeKeys.all, 'review', reviewId] as const,
};

/**
 * Hook for fetching all disputes (admin only)
 */
export const useDisputes = (params: DisputeQueryParams = {}) => {
  return useQuery({
    queryKey: disputeKeys.list(params),
    queryFn: async () => {
      const response = await DisputeService.getAllDisputes(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch disputes');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Disable retries to prevent duplicate toast notifications
  });
};

/**
 * Hook for getting dispute information for a specific review
 */
export const useDisputeByReviewId = (reviewId: string, enabled = true) => {
  return useQuery({
    queryKey: disputeKeys.byReview(reviewId),
    queryFn: async () => {
      const response = await DisputeService.getDisputeByReviewId(reviewId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch dispute information');
      }
      return response.data; // This can be null if no dispute exists
    },
    enabled: !!reviewId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Disable retries to prevent duplicate toast notifications
  });
};

/**
 * Hook for resolving a dispute
 */
export const useResolveDispute = (reviewId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (disputeId: string) => {
      const response = await DisputeService.updateDispute(disputeId, { status: 'resolved' });
      if (!response.success) {
        throw new Error(response.message || 'Failed to resolve dispute');
      }
      return response.data;
    },
    onSuccess: (data, disputeId) => {
      // Invalidate and refetch disputes
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.all });
      
      // Invalidate review queries to update review status
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      
      // If reviewId is provided, invalidate the specific review detail
      if (reviewId) {
        queryClient.invalidateQueries({ queryKey: reviewKeys.detail(reviewId) });
      }
      
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
 * Hook for updating dispute
 */
export const useUpdateDispute = (reviewId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ disputeId, updateData }: { 
      disputeId: string; 
      updateData: { status?: 'active' | 'resolved', reason?: string, description?: string }
    }) => {
      const response = await DisputeService.updateDispute(disputeId, updateData);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update dispute');
      }
      return response.data;
    },
    onSuccess: (data, { disputeId, updateData }) => {
      // Invalidate and refetch disputes
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.all });
      
      // If status is being updated, also invalidate review queries
      if (updateData.status) {
        queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
        queryClient.invalidateQueries({ queryKey: reviewKeys.all });
        
        // If reviewId is provided, invalidate the specific review detail
        if (reviewId) {
          queryClient.invalidateQueries({ queryKey: reviewKeys.detail(reviewId) });
        }
      }
      
      toast.success('Dispute updated successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update dispute';
      toast.error(errorMessage);
      console.error('Update dispute error:', error);
    },
  });
};

/**
 * Hook for deleting dispute
 */
export const useDeleteDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (disputeId: string) => {
      const response = await DisputeService.deleteDispute(disputeId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete dispute');
      }
      return response.data;
    },
    onSuccess: (data, disputeId) => {
      // Invalidate and refetch disputes
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.all });
      
      toast.success('Dispute deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete dispute';
      toast.error(errorMessage);
      console.error('Delete dispute error:', error);
    },
  });
}; 