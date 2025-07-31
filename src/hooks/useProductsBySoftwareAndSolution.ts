import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/services/productService';
import { useMemo } from 'react';

export const useProductsBySoftwareAndSolution = (
  softwareId: string | null, 
  solutionId: string | null, 
  enabled: boolean = true
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', 'bySoftwareAndSolution', softwareId, solutionId, 'sorted'],
    queryFn: () => {
      if (!softwareId && !solutionId) return Promise.resolve({ data: [] });
      // Fetch products sorted by avgRating in descending order
      return ProductService.getProductsBySoftwareAndSolution({
        softwareId: softwareId || undefined,
        solutionId: solutionId || undefined,
        sortBy: 'avgRating',
        sortOrder: 'desc'
      });
    },
    enabled: enabled && (!!softwareId || !!solutionId),
    staleTime:0,
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