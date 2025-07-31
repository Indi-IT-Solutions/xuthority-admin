import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  MetaTagService,
  MetaTag,
  MetaTagFilters,
  CreateMetaTagRequest,
  UpdateMetaTagRequest,
  PaginatedMetaTags
} from '@/services/metaTagService';
import { queryClient } from '@/lib/queryClient';

// Query Keys
export const META_TAG_QUERY_KEYS = {
  all: ['metaTags'] as const,
  lists: () => [...META_TAG_QUERY_KEYS.all, 'list'] as const,
  list: (params: MetaTagFilters) => [...META_TAG_QUERY_KEYS.lists(), params] as const,
  detail: (id: string) => [...META_TAG_QUERY_KEYS.all, 'detail', id] as const,
  byPageName: (pageName: string) => [...META_TAG_QUERY_KEYS.all, 'pageName', pageName] as const,
};

// Get All Meta Tags Hook (Admin)
export const useMetaTags = (params: MetaTagFilters = {}) => {
  return useQuery({
    queryKey: META_TAG_QUERY_KEYS.list(params),
    queryFn: () => MetaTagService.getAllMetaTags(params),
  });
};

// Get Active Meta Tags Hook (Public)
export const useActiveMetaTags = (params: MetaTagFilters = {}) => {
  return useQuery({
    queryKey: [...META_TAG_QUERY_KEYS.all, 'active', params],
    queryFn: () => MetaTagService.getActiveMetaTags(params),
  });
};

// Get Meta Tag by ID Hook
export const useMetaTagById = (metaTagId: string) => {
  return useQuery({
    queryKey: META_TAG_QUERY_KEYS.detail(metaTagId),
    queryFn: () => MetaTagService.getMetaTagById(metaTagId),
    enabled: !!metaTagId,
  });
};

// Get Meta Tag by Page Name Hook
export const useMetaTagByPageName = (pageName: string) => {
  return useQuery({
    queryKey: META_TAG_QUERY_KEYS.byPageName(pageName),
    queryFn: () => MetaTagService.getMetaTagByPageName(pageName),
    enabled: !!pageName,
  });
};

// Create Meta Tag Hook
export const useCreateMetaTag = () => {
  return useMutation({
    mutationFn: (data: CreateMetaTagRequest) => MetaTagService.createMetaTag(data),
    onSuccess: () => {
      toast.dismiss()
      toast.success('Meta tag created successfully');
      
      // Invalidate and refetch meta tags queries
      queryClient.invalidateQueries({ queryKey: META_TAG_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...META_TAG_QUERY_KEYS.all, 'active'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.response?.data?.message || 
                          'Failed to create meta tag';
      toast.dismiss()
      toast.error(errorMessage);
    },
  });
};

// Update Meta Tag Hook
export const useUpdateMetaTag = () => {
  return useMutation({
    mutationFn: ({ metaTagId, data }: { metaTagId: string; data: UpdateMetaTagRequest }) =>
      MetaTagService.updateMetaTag(metaTagId, data),
    onSuccess: (_, variables) => {
      toast.dismiss()
      toast.success('Meta tag updated successfully');
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: META_TAG_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...META_TAG_QUERY_KEYS.all, 'active'] });
      queryClient.invalidateQueries({ queryKey: META_TAG_QUERY_KEYS.detail(variables.metaTagId) });
      // Also invalidate page name-based queries
      queryClient.invalidateQueries({ queryKey: META_TAG_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.response?.data?.message || 
                          'Failed to update meta tag';
      toast.dismiss()
      toast.error(errorMessage);
    },
  });
};

// Delete Meta Tag Hook
export const useDeleteMetaTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (metaTagId: string) => MetaTagService.deleteMetaTag(metaTagId),
    onSuccess: () => {
      toast.dismiss()
      toast.success('Meta tag deleted successfully');
      
      // Invalidate and refetch meta tags queries
      queryClient.invalidateQueries({ queryKey: META_TAG_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...META_TAG_QUERY_KEYS.all, 'active'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.response?.data?.message || 
                          'Failed to delete meta tag';
      toast.dismiss()
      toast.error(errorMessage);
    },
  });
};

// Toggle Meta Tag Status Hook
export const useToggleMetaTagStatus = () => {
  return useMutation({
    mutationFn: (metaTagId: string) => MetaTagService.toggleMetaTagStatus(metaTagId),
    onSuccess: (data) => {
      const newStatus = data.data?.status;
      toast.dismiss()
      toast.success(`Meta tag ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      
      // Invalidate and refetch meta tags queries
      queryClient.invalidateQueries({ queryKey: META_TAG_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...META_TAG_QUERY_KEYS.all, 'active'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.response?.data?.message || 
                          'Failed to toggle meta tag status';
      toast.dismiss()
      toast.error(errorMessage);
    },
  });
};

// Bulk Delete Meta Tags Hook
export const useBulkDeleteMetaTags = () => {
  return useMutation({
    mutationFn: (metaTagIds: string[]) => MetaTagService.bulkDeleteMetaTags(metaTagIds),
    onSuccess: (data) => {
      const deletedCount = data.data?.deletedCount || 0;
      toast.success(`${deletedCount} meta tag${deletedCount !== 1 ? 's' : ''} deleted successfully`);
      
      // Invalidate and refetch meta tags queries
      queryClient.invalidateQueries({ queryKey: META_TAG_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: [...META_TAG_QUERY_KEYS.all, 'active'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.response?.data?.message || 
                          'Failed to delete meta tags';
      toast.dismiss()
      toast.error(errorMessage);
    },
  });
};

// Export all hooks and types
export type { MetaTag, MetaTagFilters, CreateMetaTagRequest, UpdateMetaTagRequest, PaginatedMetaTags };
export { MetaTagService }; 