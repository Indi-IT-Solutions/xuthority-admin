import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService, UserQueryParams, UsersApiResponse } from '@/services/userService';
import toast from 'react-hot-toast';

// Query keys for caching
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserQueryParams) => [...userKeys.lists(), params] as const,
};

/**
 * Hook for fetching users with pagination, search, and filtering
 */
export const useUsers = (params: UserQueryParams = {}) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const response = await UserService.getUsers(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch users');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    retry: false, // Disable retries to prevent duplicate toast notifications
  });
};

/**
 * Hook for blocking a user
 */
export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await UserService.blockUser(userId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to block user');
      }
      return response.data;
    },
    onMutate: async (userId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.all });

      // Optimistically update all user-related queries
      queryClient.setQueriesData({ queryKey: userKeys.all }, (oldData: any) => {
        if (!oldData) return oldData;
        
        // Update user in lists
        if (oldData.users) {
          return {
            ...oldData,
            users: oldData.users.map((user: any) => 
              user._id === userId ? { ...user, status: 'blocked' } : user
            )
          };
        }
        
        // Update single user data
        if (oldData._id === userId || oldData.data?._id === userId) {
          return oldData.data 
            ? { ...oldData, data: { ...oldData.data, status: 'blocked' } }
            : { ...oldData, status: 'blocked' };
        }
        
        return oldData;
      });
    },
    onSuccess: () => {
      // Invalidate and refetch all user queries
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User blocked successfully');
    },
    onError: (error: any, userId: string, context: any) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to block user';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for unblocking a user
 */
export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await UserService.unblockUser(userId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to unblock user');
      }
      return response.data;
    },
    onMutate: async (userId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.all });

      // Optimistically update all user-related queries
      queryClient.setQueriesData({ queryKey: userKeys.all }, (oldData: any) => {
        if (!oldData) return oldData;
        
        // Update user in lists
        if (oldData.users) {
          return {
            ...oldData,
            users: oldData.users.map((user: any) => 
              user._id === userId ? { ...user, status: 'approved' } : user
            )
          };
        }
        
        // Update single user data
        if (oldData._id === userId || oldData.data?._id === userId) {
          return oldData.data 
            ? { ...oldData, data: { ...oldData.data, status: 'approved' } }
            : { ...oldData, status: 'approved' };
        }
        
        return oldData;
      });
    },
    onSuccess: () => {
      // Invalidate and refetch all user queries
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User unblocked successfully');
    },
    onError: (error: any, userId: string, context: any) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to unblock user';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for deleting a user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await UserService.deleteUser(userId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete user');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to delete user';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for verifying a user
 */
export const useVerifyUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await UserService.verifyUser(userId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to verify user');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User verified successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to verify user';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for getting a specific user by ID
 */
export const useUser = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: [...userKeys.all, 'detail', userId],
    queryFn: async () => {
      const response = await UserService.getUserById(userId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch user');
      }
      return response.data;
    },
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Disable retries to prevent duplicate toast notifications
  });
};

/**
 * Hook for getting user details (alias for useUser)
 */
export const useUserDetails = (userId: string, enabled = true) => {
  return useUser(userId, enabled);
};

/**
 * Hook for getting user profile statistics
 */
export const useUserProfileStats = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: [...userKeys.all, 'stats', userId],
    queryFn: async () => {
      const response = await UserService.getUserProfileStats(userId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch user profile stats');
      }
      return response.data;
    },
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Disable retries to prevent duplicate toast notifications
  });
};

/**
 * Hook for getting user reviews with pagination
 */
export const useUserReviews = (userId: string, options?: {
  page?: number;
  limit?: number;
  status?: 'all' | 'approved' | 'pending' | 'disputed';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}, enabled = true) => {
  return useQuery({
    queryKey: [...userKeys.all, 'reviews', userId, options],
    queryFn: async () => {
      const response = await UserService.getUserReviews(userId, options);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch user reviews');
      }
      return response.data;
    },
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Disable retries to prevent duplicate toast notifications
  });
};

/**
 * Hook for getting user details by slug (same as vendor details)
 */
export const useUserDetailsBySlug = (slug: string) => {
  return useQuery({
    queryKey: [...userKeys.all, 'details-slug', slug],
    queryFn: async () => {
      const response = await UserService.getUserBySlug(slug);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch user details');
      }
      return response;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Disable retries to prevent duplicate toast notifications
  });
};

/**
 * Hook for getting user profile stats by slug (same as vendor stats)
 */
export const useUserProfileStatsBySlug = (slug: string) => {
  return useQuery({
    queryKey: [...userKeys.all, 'stats-slug', slug],
    queryFn: async () => {
      const response = await UserService.getUserProfileStatsBySlug(slug);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch user profile stats');
      }
      return response.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Disable retries to prevent duplicate toast notifications
  });
};

/**
 * Hook for getting user reviews by slug with pagination
 */
export const useUserReviewsBySlug = (slug: string, options?: {
  page?: number;
  limit?: number;
  status?: 'all' | 'approved' | 'pending' | 'disputed';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}, enabled = true) => {
  return useQuery({
    queryKey: [...userKeys.all, 'reviews-slug', slug, options],
    queryFn: async () => {
      const response = await UserService.getUserReviewsBySlug(slug, options);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch user reviews');
      }
      return response.data;
    },
    enabled: !!slug && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Disable retries to prevent duplicate toast notifications
  });
};

/**
 * Hook for bulk delete users
 */
export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIds: string[]) => {
      // Delete users sequentially to avoid overwhelming the server
      const results = [];
      for (const userId of userIds) {
        const response = await UserService.deleteUser(userId);
        results.push(response);
      }
      return results;
    },
    onSuccess: (_, userIds) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      const count = userIds.length;
      toast.success(`Successfully deleted ${count} user${count > 1 ? 's' : ''}`);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to delete users';
      toast.error(errorMessage);
    },
  });
}; 