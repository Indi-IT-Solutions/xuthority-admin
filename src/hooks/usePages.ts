import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  PageService,
  Page,
  PageFilters,
  CreatePageRequest,
  UpdatePageRequest,
  PaginatedPages
} from '@/services/pageService';
import { queryClient } from '@/lib/queryClient';

// Query Keys
export const PAGE_QUERY_KEYS = {
  all: ['pages'] as const,
  lists: () => [...PAGE_QUERY_KEYS.all, 'list'] as const,
  list: (params: PageFilters) => [...PAGE_QUERY_KEYS.lists(), params] as const,
  detail: (id: string) => [...PAGE_QUERY_KEYS.all, 'detail', id] as const,
  bySlug: (slug: string) => [...PAGE_QUERY_KEYS.all, 'slug', slug] as const,
};

// Get All Pages Hook (Admin)
export const usePages = (params: PageFilters = {}) => {
  return useQuery({
    queryKey: PAGE_QUERY_KEYS.list(params),
    queryFn: () => PageService.getAllPages(params),
  });
};

// Get Active Pages Hook (Public)
export const useActivePages = (params: PageFilters = {}) => {
  return useQuery({
    queryKey: [...PAGE_QUERY_KEYS.all, 'active', params],
    queryFn: () => PageService.getActivePages(params),
  });
};

// Get Page by ID Hook
export const usePageById = (pageId: string) => {
  return useQuery({
    queryKey: PAGE_QUERY_KEYS.detail(pageId),
    queryFn: () => PageService.getPageById(pageId),
    enabled: !!pageId,
  });
};

// Get Page by Slug Hook
export const usePageBySlug = (slug: string) => {
  return useQuery({
    queryKey: PAGE_QUERY_KEYS.bySlug(slug),
    queryFn: () => PageService.getPageBySlug(slug),
    enabled: !!slug,
  });
};

// Create Page Hook
export const useCreatePage = () => {
  
  return useMutation({
    mutationFn: (data: CreatePageRequest) => PageService.createPage(data),
    onSuccess: () => {
      toast.dismiss()
      toast.success('Page created successfully');
      
      // Invalidate and refetch pages queries
      queryClient.invalidateQueries({ queryKey: PAGE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...PAGE_QUERY_KEYS.all, 'active'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.response?.data?.message || 
                          'Failed to create page';
                          toast.dismiss()
      toast.error(errorMessage);
    },
  });
};

// Update Page Hook
export const useUpdatePage = () => {
  
  return useMutation({
    mutationFn: ({ pageId, data }: { pageId: string; data: UpdatePageRequest }) =>
      PageService.updatePage(pageId, data),
    onSuccess: (_, variables) => {
      toast.dismiss()
      toast.success('Page updated successfully');
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: PAGE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...PAGE_QUERY_KEYS.all, 'active'] });
      queryClient.invalidateQueries({ queryKey: PAGE_QUERY_KEYS.detail(variables.pageId) });
      // Also invalidate slug-based queries
      queryClient.invalidateQueries({ queryKey: PAGE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.response?.data?.message || 
                          'Failed to update page';
                          toast.dismiss()
      toast.error(errorMessage);
    },
  });
};

// Delete Page Hook
export const useDeletePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pageId: string) => PageService.deletePage(pageId),
    onSuccess: () => {
      toast.dismiss()
      toast.success('Page deleted successfully');
      
      // Invalidate and refetch pages queries
      queryClient.invalidateQueries({ queryKey: PAGE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...PAGE_QUERY_KEYS.all, 'active'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.response?.data?.message || 
                          'Failed to delete page';
                          toast.dismiss()
      toast.error(errorMessage);
    },
  });
};

// Toggle Page Status Hook
export const useTogglePageStatus = () => {
  
  return useMutation({
    mutationFn: (pageId: string) => PageService.togglePageStatus(pageId),
    onSuccess: (data) => {
      const newStatus = data.data?.status;
      toast.dismiss()
      toast.success(`Page ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      
      // Invalidate and refetch pages queries
      queryClient.invalidateQueries({ queryKey: PAGE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...PAGE_QUERY_KEYS.all, 'active'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.response?.data?.message || 
                          'Failed to toggle page status';
                          toast.dismiss()
      toast.error(errorMessage);
    },
  });
};

// Bulk Delete Pages Hook
export const useBulkDeletePages = () => {
  
  return useMutation({
    mutationFn: (pageIds: string[]) => PageService.bulkDeletePages(pageIds),
    onSuccess: (data) => {
      const deletedCount = data.data?.deletedCount || 0;
      toast.success(`${deletedCount} page${deletedCount !== 1 ? 's' : ''} deleted successfully`);
      
      // Invalidate and refetch pages queries
      queryClient.invalidateQueries({ queryKey: PAGE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...PAGE_QUERY_KEYS.all, 'active'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.response?.data?.message || 
                          'Failed to delete pages';
                          toast.dismiss()
      toast.error(errorMessage);
    },
  });
};

// Export all hooks and types
export type { Page, PageFilters, CreatePageRequest, UpdatePageRequest, PaginatedPages };
export { PageService }; 