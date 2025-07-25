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

export const useAdminBlogs = (params: AdminBlogParams = {}): UseAdminBlogsReturn => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-blogs', params],
    queryFn: async () => {
      const response = await BlogService.getAdminBlogs(params);
      
      // Transform the response to match our expected structure
      if (response.success && response.data) {
        // Handle both possible response structures
        if ('blogs' in response.data) {
          // New structure: { blogs: Blog[], pagination: {} }
          return {
            blogs: response.data.blogs || [],
            pagination: response.data.pagination || null
          };
        } else if (Array.isArray(response.data)) {
          // Legacy structure: Blog[] directly
          return {
            blogs: response.data,
            pagination: null
          };
        }
      }
      
      return {
        blogs: [],
        pagination: null
      };
    },
  });

  return {
    blogs: data?.blogs || [],
    pagination: data?.pagination || null,
    isLoading,
    error,
    refetch,
  };
}; 