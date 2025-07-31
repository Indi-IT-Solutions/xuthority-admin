import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/services/productService';
import { useMemo } from 'react';

export const useProductsBySoftwareOrSolution = (
  id: string | null, 
  enabled: boolean = true
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', 'bySoftwareOrSolution', id],
    queryFn: () => {
      if (!id) return Promise.resolve({ data: [] });
      // Fetch products that have this ID in either softwareIds or solutionIds
      return ProductService.getProductsBySoftwareOrSolution(id);
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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