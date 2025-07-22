import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VendorService, VendorQueryParams, VendorsApiResponse } from '@/services/vendorService';
import toast from 'react-hot-toast';

// Query keys for caching
export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (params: VendorQueryParams) => [...vendorKeys.lists(), params] as const,
};

/**
 * Hook for fetching vendors with pagination, search, and filtering
 */
export const useVendors = (params: VendorQueryParams = {}) => {
  return useQuery({
    queryKey: vendorKeys.list(params),
    queryFn: async () => {
      const response = await VendorService.getVendors(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch vendors');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    retry: 2,
  });
};

/**
 * Hook for verifying a vendor (legacy)
 */
export const useVerifyVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorId: string) => {
      const response = await VendorService.verifyVendor(vendorId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to verify vendor');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all vendor queries to refetch data
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success('Vendor verified successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to verify vendor';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for approving a vendor
 */
export const useApproveVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorId: string) => {
      const response = await VendorService.approveVendor(vendorId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to approve vendor');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all vendor queries to refetch data
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success('Vendor approved successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to approve vendor';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for rejecting a vendor
 */
export const useRejectVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vendorId, reason }: { vendorId: string; reason?: string }) => {
      const response = await VendorService.rejectVendor(vendorId, reason);
      if (!response.success) {
        throw new Error(response.message || 'Failed to reject vendor');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all vendor queries to refetch data
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success('Vendor rejected and deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to reject vendor';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for blocking a vendor
 */
export const useBlockVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorId: string) => {
      const response = await VendorService.blockVendor(vendorId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to block vendor');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success('Vendor blocked successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to block vendor';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for unblocking a vendor
 */
export const useUnblockVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorId: string) => {
      const response = await VendorService.unblockVendor(vendorId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to unblock vendor');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success('Vendor unblocked successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to unblock vendor';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for deleting a vendor
 */
export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorId: string) => {
      const response = await VendorService.deleteVendor(vendorId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete vendor');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success('Vendor deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to delete vendor';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for bulk deleting vendors
 */
export const useBulkDeleteVendors = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorIds: string[]) => {
      const response = await VendorService.bulkDeleteVendors(vendorIds);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete vendors');
      }
      return response.data;
    },
    onSuccess: (_, vendorIds) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success(`Successfully deleted ${vendorIds.length} vendor${vendorIds.length > 1 ? 's' : ''}`);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to delete vendors';
      toast.error(errorMessage);
    },
  });
}; 