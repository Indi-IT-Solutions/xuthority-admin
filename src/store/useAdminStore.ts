import { queryClient } from '@/lib/queryClient';
import { AdminAuthService, AdminLoginRequest, Admin } from '@/services/adminAuthService';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: string;
  displayName: string;
  role: 'admin';
  avatar?: string;
  firstName: string;
  lastName: string;
  slug?: string;
  email: string;
}

interface AdminStore {
  // Authentication state
  isLoggedIn: boolean;
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  // UI state
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  error: string | null;
  
  // Actions
  login: (user: AdminUser, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<AdminUser>) => void;
  initializeAuth: () => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setLoading: (loading: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setError: (error: string | null) => void;
  getProfileWithAPI: () => Promise<void>;
  loginWithAPI: (credentials: AdminLoginRequest) => Promise<boolean>;
  loginWithToken: (user: Admin, token: string) => Promise<boolean>;
  logoutWithAPI: () => Promise<void>;
}

const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoggedIn: false,
      user: null,
      token: null,
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      isLoading: false,
      error: null,
      // Actions
      login: (user, token) => {
        set({
          isLoggedIn: true,
          user,
          token,
        });
      },

      logout: () => {
        // Clear token from API service storage first
        AdminAuthService.tokenStorage.removeToken();
        
        set({
          isLoggedIn: false,
          user: null,
          token: null,
        });
        // Clear any additional cleanup here
        localStorage.removeItem('admin-auth');
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          });
        }
      },

      initializeAuth: () => {
        const token = get().token;
        const user = get().user;
        
        if (token && user) {
          set({
            isLoggedIn: true,
          });
        } else {
          set({
            isLoggedIn: false,
            user: null,
            token: null,
          });
        }
      },

      toggleSidebar: () => {
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed
        }));
      },

      toggleMobileSidebar: () => {
        set((state) => ({
          mobileSidebarOpen: !state.mobileSidebarOpen
        }));
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },

      setMobileSidebarOpen: (open) => {
        set({ mobileSidebarOpen: open });
      },

            
      loginWithAPI: async (credentials: AdminLoginRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
          const response = await AdminAuthService.login(credentials);
          console.log('response', response)
          if (response.success && response.data) {
            // Map API response to AdminUser format
            const userInfo: AdminUser = {
              id: response.data.admin._id,
              displayName: `${response.data.admin.firstName} ${response.data.admin.lastName}`,
              firstName: response.data.admin.firstName,
              lastName: response.data.admin.lastName,
              email: response.data.admin.email,
              avatar: response.data.admin.avatar,
              role: 'admin',
              ...response.data.admin, // Include any other fields from the response
            };
            
            // Extract accessToken from admin object
            const token = response.data.admin.accessToken || response.data.token;
            
            // Set the token in storage immediately
            if (token) {
              AdminAuthService.tokenStorage.setToken(token);
            }
            
            set({
              user: userInfo,
              token: token,
              isLoggedIn: true,
              isLoading: false,
              error: null,
            });
            toast.dismiss()
            toast.success('Login successful!');
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Login failed',
            });
            console.log('response', response)
            return false;
          }
        } catch (error: any) {
          console.log('error', error)
          toast.dismiss()
          toast.error(error.response?.data?.error?.message || 'Login failed');
          const errorMessage = error.response?.data?.message || error.message || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },
      
      loginWithToken: async (user: Admin, token: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
          // Map API response to UserInfo format
          const userInfo: AdminUser = {
            id: user._id || user.id,
            displayName: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
            role: 'admin',
            ...user, // Include any other fields from the response
          };
          
          // Set the token in storage
          AdminAuthService.tokenStorage.setToken(token);
          
          set({
            user: userInfo,
            token: token,
            isLoggedIn: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },
      getProfileWithAPI: async () => {
        try {
          const response = await AdminAuthService.getProfile();
          if (response.success && response.data) {
            // Map API response to AdminUser format
            const userInfo: AdminUser = {
              id: response.data.admin._id,
              displayName: `${response.data.admin.firstName} ${response.data.admin.lastName}`,
              firstName: response.data.admin.firstName,
              lastName: response.data.admin.lastName,
              email: response.data.admin.email,
              avatar: response.data.admin.avatar,
              role: 'admin',
              ...response.data.admin, // Include any other fields from the response
            };
            
            set({
              user: userInfo,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Failed to get profile',
            });
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || 'Failed to get profile';
          set({
            isLoading: false,
            error: errorMessage,
          });
          // If profile fetch fails, user might not be authenticated
          if (error.response?.status === 401) {
            set({
              user: null,
              token: null,
              isLoggedIn: false,
            });
          }
        }
      },
      logoutWithAPI: async () => {
        set({ isLoading: true });
        try {
          AdminAuthService.tokenStorage.removeToken();
          // Clear auth-related queries more gracefully
          setTimeout(() => {
            queryClient.removeQueries({ queryKey: ['admin'] });
            queryClient.removeQueries({ queryKey: ['adminProfile'] });
            queryClient.removeQueries({ queryKey: ['adminAnalytics'] });
            queryClient.removeQueries({ queryKey: ['adminUsers'] });
            localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
          }, 100);
          set({
            user: null,
            token: null,
            isLoggedIn: false,
            isLoading: false,
            error: null,
          });
          toast.dismiss()
          toast.success('Successfully logged out!');
        } catch (error) {
          AdminAuthService.tokenStorage.removeToken();
          // Clear auth-related queries more gracefully
          setTimeout(() => {
            queryClient.removeQueries({ queryKey: ['admin'] });
            queryClient.removeQueries({ queryKey: ['adminProfile'] });
            queryClient.removeQueries({ queryKey: ['adminAnalytics'] });
            queryClient.removeQueries({ queryKey: ['adminUsers'] });
            localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
          }, 100);
          set({
            user: null,
            token: null,
            isLoggedIn: false,
            isLoading: false,
            error: null,
          });
          toast.dismiss()
          toast.success('Successfully logged out!');
        }
      },  
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },
      }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
        sidebarCollapsed: state.sidebarCollapsed,
        mobileSidebarOpen: state.mobileSidebarOpen,
        isLoading: state.isLoading,
        error: state.error,

      }),
    }
  )
);

// --- Global effect to sync isLoggedIn with token on app load and token changes ---
// This should be placed after the store definition
if (typeof window !== 'undefined') {
  const syncAuthState = () => {
    const token = AdminAuthService.tokenStorage.getToken();
    const { isLoggedIn, logout } = useAdminStore.getState();
    if (!token && isLoggedIn) {
      // Token missing but store says logged in: force logout
      useAdminStore.getState().logout();
    } else if (token && !isLoggedIn) {
      // Token present but store says not logged in: try to rehydrate (optional)
      // You could fetch profile here if needed
      // For now, do nothing (user must log in again)
    }
  };

  // Run on app load
  syncAuthState();

  // Listen for storage changes (e.g., logout in another tab)
  window.addEventListener('storage', (event) => {
    if (event.key === 'xuthority_access_token') {
      syncAuthState();
    }
  });
}

export default useAdminStore; 