import { useQuery } from '@tanstack/react-query';
import { AdminProductService, ProductListQuery, ProductsApiResponse } from '@/services/adminProductService';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export const productKeys = {
  all: ['admin-products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListQuery) => [...productKeys.lists(), params] as const,
};

export const useAdminProducts = (params: ProductListQuery = {}) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      const response = await AdminProductService.list(params);
      if (!response.success || !response.data) throw new Error(response.message || 'Failed to fetch products');
      return response.data as ProductsApiResponse;
    },
    // staleTime: 5 * 60 * 1000,
    // gcTime: 10 * 60 * 1000,
    retry: false,
  });
};

export const useApproveProduct = () => {
  
  return useMutation({
    mutationFn: async (productId: string) => AdminProductService.approve(productId),
    onSuccess: async () => {
      // Invalidate all admin product lists
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

export const useRejectProduct = () => {
  return useMutation({
    mutationFn: async ({ productId, reason }: { productId: string; reason?: string }) =>
      AdminProductService.reject(productId, reason),
    onSuccess: async () => {
      // Invalidate product lists as well
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
    }
  });
};


