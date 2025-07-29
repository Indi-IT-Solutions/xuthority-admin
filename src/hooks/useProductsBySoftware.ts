import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ProductService } from '@/services/productService';
import { useMemo } from 'react';

export const useProductsBySoftware = (softwareId: string | null, enabled: boolean = true) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', 'bySoftware', softwareId, 'sorted'],
    queryFn: () => {
      if (!softwareId) return Promise.resolve({ data: [] });
      // Fetch products sorted by avgRating in descending order
      return ProductService.getProductsBySoftware(softwareId, {
        sortBy: 'avgRating',
        sortOrder: 'desc'
      });
    },
    enabled: enabled && !!softwareId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const options = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((item) => ({
      value: item._id,
      label: item.name,
      slug: item.slug,
    }));
  }, [data]);

  return { options, isLoading, error };
};