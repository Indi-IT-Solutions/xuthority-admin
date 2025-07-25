import { useQuery } from '@tanstack/react-query';
import { BlogService, ResourceCategory } from '@/services/blogService';

export const useResourceCategories = () => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['resource-categories'],
    queryFn: async () => {
      const response = await BlogService.getResourceCategories();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 3,
  });

  return {
    categories: data || [],
    isLoading,
    error,
    refetch,
  };
}; 