import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  AdminAuthService, 
  AdminLoginRequest, 
  AdminUpdateProfileRequest, 
  AdminChangePasswordRequest 
} from '../services/adminAuthService';
import { queryClient } from '@/lib/queryClient';
import useAdminStore from '@/store/useAdminStore';
import { useToast } from './useToast';
import { withMutationMonitoring } from '@/utils/mutaionMointir';
import { getDefaultMutationRetry, withMutationTimeout } from '@/utils/mutationTimeout';
import toast from 'react-hot-toast';

// Query keys for admin
export const queryKeys = {
  admin: ['admin'] as const,
  profile: ['adminProfile'] as const,
  analytics: ['adminAnalytics'] as const,
  users: ['adminUsers'] as const,
};

// Hook for authentication state
export const useAuth = () => {
  const { user, isLoggedIn, isLoading, error } = useAdminStore();
  return { user: user, isLoggedIn, isLoading, error };
};

// Hook for admin profile query
export const useProfile = () => {
  const { getProfileWithAPI, user } = useAdminStore();

  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      // Get the latest user from store (not the closure)
      const currentUser = useAdminStore.getState().user;
      if (!currentUser) {
        throw new Error('Admin not authenticated');
      }
     
      await getProfileWithAPI();
      // Return the latest user data from store
      return useAdminStore.getState().user;
    },
    enabled: !!user,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0,
  });
};

// Hook for admin dashboard analytics
export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: async () => {
      const response = await AdminAuthService.getDashboardAnalytics();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to fetch dashboard analytics');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('auth') || error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook for admin users list
export const useAdminUsers = (options?: {
  page?: number;
  limit?: number;
  role?: 'user' | 'vendor';
  isVerified?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: [...queryKeys.users, options],
    queryFn: async () => {
      const response = await AdminAuthService.getUsers(options);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to fetch users');
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook for admin login mutation
export const useLogin = () => {
  const navigate = useNavigate();
  const { loginWithAPI, getProfileWithAPI } = useAdminStore();
  return useMutation({
    mutationFn: withMutationMonitoring(
      async (credentials: AdminLoginRequest) => {
        const success = await withMutationTimeout(
          loginWithAPI(credentials),
          45000,
          'Login request timed out'
        );
        
        if (success) {
          // Clear auth-related queries more gracefully
          setTimeout(() => {
            queryClient.removeQueries({ queryKey: ['admin'] });
            queryClient.removeQueries({ queryKey: ['adminProfile'] });
            localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
          }, 100);

          // Wait a bit to ensure token is properly set in headers
          await new Promise(resolve => setTimeout(resolve, 200));

          // Fetch fresh profile data after successful login
          await getProfileWithAPI();
          
          // Set fresh query data with updated profile
          const user = useAdminStore.getState().user;
          if (user) {
            queryClient.setQueryData(queryKeys.admin, user);
            queryClient.setQueryData(queryKeys.profile, user);
          }
          toast.dismiss();
           toast.success('Login successful');
          return success;
        } 
      },
      'admin-login',
      50000 // 50 second timeout for monitoring
    ),
    onError: (error: any) => {
      toast.dismiss();
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed';
      toast.error(errorMessage);
      console.error('Admin login error:', error);
    },
  });
};

// Hook for admin logout mutation
export const useLogout = () => {
  const navigate = useNavigate();
  const { logoutWithAPI } = useAdminStore();

  return useMutation({
    mutationFn: async () => {
      await logoutWithAPI();
      // Navigate to login after logout
      navigate('/login');
    },
    onError: (error: any) => {
      console.error('Admin logout error:', error);
    },
  });
};

// Hook for admin profile update mutation
export const useUpdateProfile = () => {
  const { updateUser } = useAdminStore();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: async (data: AdminUpdateProfileRequest) => {
      const response = await AdminAuthService.updateProfile(data);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update profile');
      }
      return response.data;
    },
    onSuccess: (data: { admin: any }) => {
      // Update local state
      updateUser(data.admin);
      // Directly update React Query cache with fresh data
      queryClient.setQueryData(queryKeys.admin, data.admin);
      queryClient.setQueryData(queryKeys.profile, data.admin);
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.admin });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      success('Profile updated successfully');
    },
    onError: (err: any) => {
      console.error('Admin profile update error:', err);
      error(err.message || 'Failed to update profile');
    },
  });
};

// Hook for admin password change mutation
export const useChangePassword = () => {
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async (data: AdminChangePasswordRequest) => {
      const response = await AdminAuthService.changePassword(data);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to change password');
      }
      return response.data;
    },
    onSuccess: () => {
      success('Password changed successfully');
    },
    onError: (err: any) => {
      console.error('Admin password change error:', err);
      error(err.response?.data?.error?.message || err.message || 'Failed to change password');
    },
  });
};

// Hook for admin forgot password mutation
export const useForgotPassword = () => {
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await AdminAuthService.forgotPassword(data);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to send reset email');
      }
      return response.data;
    },
    onSuccess: () => {
      success('Reset email sent successfully');
    },
    onError: (err: any) => {
      console.error('Admin forgot password error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to send reset email';
      error(errorMessage);
    },
  });
};

// Hook for verifying admin reset token
export const useVerifyResetToken = () => {
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async (data: { token: string }) => {
      const response = await AdminAuthService.verifyResetToken(data);
      if (!response.success) {
        throw new Error(response.error?.message || 'Invalid or expired reset token');
      }
      return response.data;
    },
    onError: (err: any) => {
      console.error('Admin verify reset token error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Invalid or expired reset token';
      error(errorMessage);
    },
  });
};

// Hook for admin reset password mutation
export const useResetPassword = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: { token: string; newPassword: string; confirmNewPassword: string }) => {
      const response = await AdminAuthService.resetPassword(data);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to reset password');
      }
      return response.data;
    },
    onSuccess: () => {
      success('Password reset successfully');
      navigate('/login');
    },
    onError: (err: any) => {
      console.error('Admin reset password error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to reset password';
      error(errorMessage);
    },
  });
};

// Hook for admin verify vendor profile mutation
export const useVerifyVendorProfile = () => {
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await AdminAuthService.verifyVendorProfile(userId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to verify vendor profile');
      }
      return response.data;
    },
    onSuccess: () => {
      success('Vendor profile verified successfully');
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
    onError: (err: any) => {
      console.error('Verify vendor profile error:', err);
      error(err.message || 'Failed to verify vendor profile');
    },
  });
};

