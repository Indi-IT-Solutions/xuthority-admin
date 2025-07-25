import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BlogService } from '@/services/blogService';
import { toast } from 'sonner';

export interface ResourceDeleteState {
  isModalOpen: boolean;
  resourceToDelete: {
    id: string;
    title: string;
  } | null;
}

export const useResourceDelete = () => {
  const queryClient = useQueryClient();
  const [deleteState, setDeleteState] = useState<ResourceDeleteState>({
    isModalOpen: false,
    resourceToDelete: null,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => BlogService.deleteBlog(id),
    onSuccess: (response) => {
      // Invalidate and refetch admin blogs list
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      
      // Show success toast
      toast.success(response.message || 'Resource deleted successfully');
      
      // Close modal
      closeDeleteModal();
    },
    onError: (error: any) => {
      console.error('Error deleting resource:', error);
      
      // Show error toast
      const errorMessage = error?.response?.data?.message || 'Failed to delete resource';
      toast.error(errorMessage);
      
      // Close modal
      closeDeleteModal();
    },
  });

  // Open delete confirmation modal
  const openDeleteModal = (id: string, title: string) => {
    setDeleteState({
      isModalOpen: true,
      resourceToDelete: { id, title },
    });
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteState({
      isModalOpen: false,
      resourceToDelete: null,
    });
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (deleteState.resourceToDelete?.id) {
      deleteMutation.mutate(deleteState.resourceToDelete.id);
    }
  };

  return {
    deleteState,
    isDeleting: deleteMutation.isPending,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  };
}; 