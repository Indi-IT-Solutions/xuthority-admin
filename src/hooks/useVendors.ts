import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VendorService, VendorQueryParams, VendorsApiResponse, VendorProductQueryParams } from '@/services/vendorService';
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
    retry: false, // Disable retries to prevent duplicate toast notifications
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
    onMutate: async (vendorId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: vendorKeys.all });
      await queryClient.cancelQueries({ queryKey: ['vendor-details'] });
      await queryClient.cancelQueries({ queryKey: ['vendor-profile-stats'] });

      // Optimistically update all vendor-related queries
      queryClient.setQueriesData({ queryKey: vendorKeys.all }, (oldData: any) => {
        if (!oldData) return oldData;
        
        // Update vendor in lists
        if (oldData.vendors) {
          return {
            ...oldData,
            vendors: oldData.vendors.map((vendor: any) => 
              vendor._id === vendorId ? { ...vendor, status: 'blocked' } : vendor
            )
          };
        }
        
        return oldData;
      });

      // Update vendor detail queries
      queryClient.setQueriesData({ queryKey: ['vendor-details'] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (oldData.data?._id === vendorId) {
          return { ...oldData, data: { ...oldData.data, status: 'blocked' } };
        }
        return oldData;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      queryClient.invalidateQueries({ queryKey: ['vendor-details'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-profile-stats'] });
      toast.success('Vendor blocked successfully');
    },
    onError: (error: any, vendorId: string, context: any) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      queryClient.invalidateQueries({ queryKey: ['vendor-details'] });
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
    onMutate: async (vendorId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: vendorKeys.all });
      await queryClient.cancelQueries({ queryKey: ['vendor-details'] });
      await queryClient.cancelQueries({ queryKey: ['vendor-profile-stats'] });

      // Optimistically update all vendor-related queries
      queryClient.setQueriesData({ queryKey: vendorKeys.all }, (oldData: any) => {
        if (!oldData) return oldData;
        
        // Update vendor in lists
        if (oldData.vendors) {
          return {
            ...oldData,
            vendors: oldData.vendors.map((vendor: any) => 
              vendor._id === vendorId ? { ...vendor, status: 'approved' } : vendor
            )
          };
        }
        
        return oldData;
      });

      // Update vendor detail queries
      queryClient.setQueriesData({ queryKey: ['vendor-details'] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (oldData.data?._id === vendorId) {
          return { ...oldData, data: { ...oldData.data, status: 'approved' } };
        }
        return oldData;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      queryClient.invalidateQueries({ queryKey: ['vendor-details'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-profile-stats'] });
      toast.success('Vendor unblocked successfully');
    },
    onError: (error: any, vendorId: string, context: any) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      queryClient.invalidateQueries({ queryKey: ['vendor-details'] });
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

/**
 * Hook to get vendor details by slug
 */
export const useVendorDetails = (slug: string) => {
  return useQuery({
    queryKey: ['vendor-details', slug],
    queryFn: () => VendorService.getVendorBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get vendor profile statistics by slug
 */
export const useVendorProfileStats = (slug: string) => {
  return useQuery({
    queryKey: ['vendor-profile-stats', slug],
    queryFn: () => VendorService.getVendorProfileStatsBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get vendor products by user ID
 */
export const useVendorProducts = (userId: string, params: VendorProductQueryParams = {}) => {
  return useQuery({
    queryKey: ['vendor-products', userId, params],
    queryFn: () => VendorService.getVendorProducts(userId, params),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 