import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BlogService, CreateBlogRequest, Blog, ResourceCategory } from '@/services/blogService';
import toast from 'react-hot-toast';

// Query Keys
export const BLOG_QUERY_KEYS = {
  blogs: ['blogs'] as const,
  blog: (id: string) => ['blogs', id] as const,
  resourceCategories: ['resource-categories'] as const,
};

/**
 * Hook to get all blogs with pagination and filtering
 */
export const useBlogs = (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  resourceCategoryId?: string;
} = {}) => {
  return useQuery({
    queryKey: [...BLOG_QUERY_KEYS.blogs, params],
    queryFn: () => BlogService.getBlogs(params),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get a single blog by ID
 */
export const useBlog = (id: string) => {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.blog(id),
    queryFn: () => BlogService.getBlogById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get resource categories
 */
export const useResourceCategories = () => {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.resourceCategories,
    queryFn: () => BlogService.getResourceCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to create a new blog
 */
export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlogRequest) => BlogService.createBlog(data),
    onSuccess: (response) => {
      // Invalidate blogs queries to refetch data
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.blogs });
      
      // Show success toast
      toast.success('Resource created successfully!');
      
      return response.data;
    },
    onError: (error: any) => {
      console.error('Create blog error:', error);
      const message = error?.response?.data?.message || error?.message || 'Failed to create resource';
      toast.error(message);
    }
  });
};

/**
 * Hook to update a blog
 */
export const useUpdateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBlogRequest> }) => 
      BlogService.updateBlog(id, data),
    onSuccess: (response, { id }) => {
      // Invalidate blogs queries
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.blogs });
      // Invalidate specific blog query
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.blog(id) });
      
      // Show success toast
      toast.success('Resource updated successfully!');
      
      return response.data;
    },
    onError: (error: any) => {
      console.error('Update blog error:', error);
      const message = error?.response?.data?.message || error?.message || 'Failed to update resource';
      toast.error(message);
    }
  });
};

/**
 * Hook to delete a blog
 */
export const useDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => BlogService.deleteBlog(id),
    onSuccess: () => {
      // Invalidate blogs queries to refetch data
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.blogs });
      
      // Show success toast
      toast.success('Resource deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete blog error:', error);
      const message = error?.response?.data?.message || error?.message || 'Failed to delete resource';
      toast.error(message);
    }
  });
}; 