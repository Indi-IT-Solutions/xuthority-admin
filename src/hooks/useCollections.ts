import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  CollectionService,
  CollectionItem,
  CollectionFilters,
  PaginatedCollection,
  CollectionConfig
} from '@/services/collectionService';

// Query Keys
export const COLLECTION_QUERY_KEYS = {
  all: (collection: string) => ['collections', collection] as const,
  lists: (collection: string) => [...COLLECTION_QUERY_KEYS.all(collection), 'list'] as const,
  list: (collection: string, params: CollectionFilters) => [...COLLECTION_QUERY_KEYS.lists(collection), params] as const,
  detail: (collection: string, id: string) => [...COLLECTION_QUERY_KEYS.all(collection), 'detail', id] as const,
};

// Get Collection Items Hook
export const useCollectionItems = (collectionSlug: string, params: CollectionFilters = {}) => {
  return useQuery({
    queryKey: COLLECTION_QUERY_KEYS.list(collectionSlug, params),
    queryFn: () => CollectionService.getCollectionItems(collectionSlug, params),
    enabled: !!collectionSlug,
  });
};

// Get Collection Item by ID Hook
export const useCollectionItemById = (collectionSlug: string, itemId: string) => {
  return useQuery({
    queryKey: COLLECTION_QUERY_KEYS.detail(collectionSlug, itemId),
    queryFn: () => CollectionService.getCollectionItemById(collectionSlug, itemId),
    enabled: !!collectionSlug && !!itemId,
  });
};

// Create Collection Item Hook
export const useCreateCollectionItem = (collectionSlug: string) => {
  const queryClient = useQueryClient();
  const config = CollectionService.getCollectionConfig(collectionSlug);
  
  return useMutation({
    mutationFn: (data: Partial<CollectionItem>) => 
      CollectionService.createCollectionItem(collectionSlug, data),
    onSuccess: () => {
      toast.dismiss()
      toast.success(`${config.name} created successfully`);
      
      // Invalidate and refetch collection queries
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEYS.lists(collectionSlug) });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.response?.data?.message || 
                          `Failed to create ${config.name.toLowerCase()}`;
                          toast.dismiss()
      toast.error(errorMessage);
    },
  });
};

// Update Collection Item Hook
export const useUpdateCollectionItem = (collectionSlug: string) => {
  const queryClient = useQueryClient();
  const config = CollectionService.getCollectionConfig(collectionSlug);
  
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: Partial<CollectionItem> }) =>
      CollectionService.updateCollectionItem(collectionSlug, itemId, data),
    onSuccess: (data, variables) => {
      toast.dismiss()
      toast.success(`${config.name} updated successfully`);
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEYS.lists(collectionSlug) });
      queryClient.invalidateQueries({ 
        queryKey: COLLECTION_QUERY_KEYS.detail(collectionSlug, variables.itemId) 
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.response?.data?.message || 
                          `Failed to update ${config.name.toLowerCase()}`;
                          toast.dismiss()
      toast.error(errorMessage);
    },
  });
};

// Delete Collection Item Hook
export const useDeleteCollectionItem = (collectionSlug: string) => {
  const queryClient = useQueryClient();
  const config = CollectionService.getCollectionConfig(collectionSlug);
  
  return useMutation({
    mutationFn: (itemId: string) => 
      CollectionService.deleteCollectionItem(collectionSlug, itemId),
    onSuccess: () => {
      toast.dismiss()
      toast.success(`${config.name} deleted successfully`);
      
      // Invalidate and refetch collection queries
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEYS.lists(collectionSlug) });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.response?.data?.message || 
                          `Failed to delete ${config.name.toLowerCase()}`;
                          toast.dismiss()
      toast.error(errorMessage);
    },
  });
};

// Bulk Delete Collection Items Hook
export const useBulkDeleteCollectionItems = (collectionSlug: string) => {
  const queryClient = useQueryClient();
  const config = CollectionService.getCollectionConfig(collectionSlug);
  
  return useMutation({
    mutationFn: (itemIds: string[]) => 
      CollectionService.bulkDeleteCollectionItems(collectionSlug, itemIds),
    onSuccess: (data) => {
      const deletedCount = data.data?.deletedCount || 0;
      toast.dismiss()
      toast.success(`${deletedCount} ${config.name.toLowerCase()}${deletedCount !== 1 ? 's' : ''} deleted successfully`);
      
      // Invalidate and refetch collection queries
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEYS.lists(collectionSlug) });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.response?.data?.message || 
                          `Failed to delete ${config.name.toLowerCase()}s`;
                          toast.dismiss()
      toast.error(errorMessage);
    },
  });
};

// Export all types and service
export type { CollectionItem, CollectionFilters, PaginatedCollection, CollectionConfig };
export { CollectionService }; 