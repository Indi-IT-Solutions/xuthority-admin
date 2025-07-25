import { useQuery } from '@tanstack/react-query';
import { BlogService, Blog } from '@/services/blogService';

export interface AdminBlogParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  resourceCategoryId?: string;
  tag?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UseAdminBlogsReturn {
  blogs: Blog[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  isLoading: boolean;
  error: any;
  refetch: () => void;
}

export const useAdminBlogsWithFallback = (params: AdminBlogParams = {}): UseAdminBlogsReturn => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-blogs-with-fallback', params],
    queryFn: async () => {
      try {
        // First, try the specific search
        const response = await BlogService.getAdminBlogs(params);
        
        // If we get results, return them
        if (response.success && response.data) {
          if ('blogs' in response.data && response.data.blogs.length > 0) {
            return {
              blogs: response.data.blogs || [],
              pagination: response.data.pagination || null
            };
          } else if (Array.isArray(response.data) && response.data.length > 0) {
            return {
              blogs: response.data,
              pagination: null
            };
          }
        }
        
        // If no results and we have a search term, try fallback without search
        if (params.search) {
          const fallbackParams = { ...params };
          delete fallbackParams.search; // Remove search parameter
          
          const fallbackResponse = await BlogService.getAdminBlogs(fallbackParams);
          
          if (fallbackResponse.success && fallbackResponse.data) {
            if ('blogs' in fallbackResponse.data) {
              return {
                blogs: fallbackResponse.data.blogs || [],
                pagination: fallbackResponse.data.pagination || null
              };
            } else if (Array.isArray(fallbackResponse.data)) {
              return {
                blogs: fallbackResponse.data,
                pagination: null
              };
            }
          }
        }
        
        // If still no results, return empty
        return {
          blogs: [],
          pagination: null
        };
        
      } catch (error) {
        console.error('Error fetching admin blogs:', error);
        throw error;
      }
    },
    retry: 1, // Only retry once since we have fallback logic
  });

  return {
    blogs: data?.blogs || [],
    pagination: data?.pagination || null,
    isLoading,
    error,
    refetch,
  };
}; 