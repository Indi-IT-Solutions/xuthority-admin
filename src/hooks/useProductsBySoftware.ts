import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/services/productService';
import { useMemo } from 'react';

export const useProductsBySoftware = (softwareId: string | null, enabled: boolean = true) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', 'bySoftware', softwareId, 'sorted'],
    queryFn: () => {
      if (!softwareId) return Promise.resolve({ data: [] });
      return ProductService.getProductsBySoftware(softwareId, {
        sortBy: 'avgRating',
        sortOrder: 'desc'
      });
    },
    enabled: enabled && !!softwareId,
    staleTime: 0,
    gcTime: 0,
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