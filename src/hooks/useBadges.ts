import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  getBadges,
  getBadgeRequests,
  updateBadgeStatus,
  createBadge,
  updateBadge,
  deleteBadge,
  approveBadgeRequest,
  rejectBadgeRequest,
  getBadgeRequestDetails,
  getBadgeById,
  BadgeParams,
  TransformedBadge,
} from '@/services/badgeService';

// Query Keys
export const BADGE_QUERY_KEYS = {
  all: ['badges'] as const,
  lists: () => [...BADGE_QUERY_KEYS.all, 'list'] as const,
  list: (params: BadgeParams) => [...BADGE_QUERY_KEYS.lists(), params] as const,
  detail: (id: string) => [...BADGE_QUERY_KEYS.all, 'detail', id] as const,
  requests: () => [...BADGE_QUERY_KEYS.all, 'requests'] as const,
  requestList: (params: BadgeParams) => [...BADGE_QUERY_KEYS.requests(), params] as const,
  requestDetails: (id: string) => [...BADGE_QUERY_KEYS.requests(), 'detail', id] as const,
};

// Get Badges Hook
export const useBadges = (params: BadgeParams = {}) => {
  return useQuery({
    queryKey: BADGE_QUERY_KEYS.list(params),
    queryFn: () => getBadges(params),

  });
};

// Get Badge Requests Hook
export const useBadgeRequests = (params: BadgeParams = {}) => {
  return useQuery({
    queryKey: BADGE_QUERY_KEYS.requestList(params),
    queryFn: () => getBadgeRequests(params),

  });
};

// Update Badge Status Hook
export const useUpdateBadgeStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ badgeId, status }: { badgeId: string; status: 'active' | 'inactive' }) =>
      updateBadgeStatus(badgeId, status),
    onSuccess: (data, variables) => {
      toast.success(`Badge ${variables.status === 'active' ? 'activated' : 'deactivated'} successfully`);
      
      // Invalidate and refetch badges queries
      queryClient.invalidateQueries({ queryKey: BADGE_QUERY_KEYS.lists() });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to update badge status';
      toast.error(errorMessage);
    },
  });
};

// Create Badge Hook
export const useCreateBadge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBadge,
    onSuccess: () => {
      toast.success('Badge created successfully');
      queryClient.invalidateQueries({ queryKey: BADGE_QUERY_KEYS.lists() });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to create badge';
      toast.error(errorMessage);
    },
  });
};

// Update Badge Hook
export const useUpdateBadge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ badgeId, badgeData }: { badgeId: string; badgeData: Partial<TransformedBadge> }) =>
      updateBadge(badgeId, badgeData),
    onSuccess: (data, variables) => {
      toast.success('Badge updated successfully');
      
      // Invalidate all badge lists and the specific badge detail
      queryClient.invalidateQueries({ queryKey: BADGE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BADGE_QUERY_KEYS.detail(variables.badgeId) });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to update badge';
      toast.error(errorMessage);
    },
  });
};

// Delete Badge Hook
export const useDeleteBadge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteBadge,
    onSuccess: () => {
      toast.success('Badge deleted successfully');
      queryClient.invalidateQueries({ queryKey: BADGE_QUERY_KEYS.lists() });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to delete badge';
      toast.error(errorMessage);
    },
  });
};

// Approve Badge Request Hook
export const useApproveBadgeRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: approveBadgeRequest,
    onSuccess: () => {
      toast.success('Badge request approved successfully');
      queryClient.invalidateQueries({ queryKey: BADGE_QUERY_KEYS.requests() });
      queryClient.invalidateQueries({ queryKey: BADGE_QUERY_KEYS.lists() });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to approve badge request';
      toast.error(errorMessage);
    },
  });
};

// Reject Badge Request Hook
export const useRejectBadgeRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason?: string }) =>
      rejectBadgeRequest(requestId, reason),
    onSuccess: () => {
      toast.success('Badge request rejected');
      queryClient.invalidateQueries({ queryKey: BADGE_QUERY_KEYS.requests() });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to reject badge request';
      toast.error(errorMessage);
    },
  });
};

// Get Badge Request Details Hook
export const useBadgeRequestDetails = (requestId: string) => {
  return useQuery({
    queryKey: BADGE_QUERY_KEYS.requestDetails(requestId),
    queryFn: () => getBadgeRequestDetails(requestId),
    enabled: !!requestId,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

// Get Badge by ID Hook
export const useGetBadge = (badgeId: string) => {
  return useQuery({
    queryKey: BADGE_QUERY_KEYS.detail(badgeId),
    queryFn: () => getBadgeById(badgeId),
    enabled: !!badgeId,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
}; 