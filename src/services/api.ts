import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';
console.log('🔧 API_BASE_URL configured as:', API_BASE_URL);
console.log('🔧 Environment:', (import.meta as any).env?.VITE_APP_ENV || 'development');

const API_TIMEOUT = 30000; // 30 seconds
const FILE_UPLOAD_TIMEOUT = 300000; // 5 minutes for file uploads

// Token storage keys
const TOKEN_KEY = 'xuthority_access_token';
const REFRESH_TOKEN_KEY = 'xuthority_refresh_token';

// Custom error interface
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
}

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNext: boolean;
      page?: number;
      pages?: number;
      total?: number;
      limit?: number;
      hasPrev: boolean;
    };
    total?: number;
    productInfo?: {
      id: string;
      name: string;
      avgRating: number;
      totalReviews: number;
      ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
      };
    };
  };
  error?: ApiError;
}

// Token management utilities
export const tokenStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  
  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getToken();
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log("🌐 API Request to:", fullUrl);
    console.log("🔐 Token from storage:", token ? 'Present' : 'Missing');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization header set:", config.headers.Authorization);
    } else if (!token) {
      console.log("No token found in storage");
    }
    
    // Don't set Content-Type for FormData (let browser set it with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Get the request URL to check if it's an auth endpoint
    const requestUrl = originalRequest.url || '';
    const isAuthEndpoint = requestUrl.includes('/auth/login') || 
                          requestUrl.includes('/auth/forgot-password') || 
                          requestUrl.includes('/auth/reset-password') || 
                          requestUrl.includes('/auth/verify-reset-token') ||
                          requestUrl.includes('/auth/register');
    
    // Handle 401 Unauthorized errors (but skip retry for auth endpoints)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      
      // Check if we have a refresh token
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });
          
          const { accessToken } = refreshResponse.data.data;
          tokenStorage.setToken(accessToken);
          
          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          // tokenStorage.removeToken();
          // window.location.href = '/';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        tokenStorage.removeToken();
        // window.location.href = '/login';
      }
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.error?.message || 
                        error.response?.data?.message || 
                        error.message || 
                        'An unexpected error occurred';
    
    // Show error toast for non-401 errors or auth endpoint 401s
    if (error.response?.status !== 401 || isAuthEndpoint) {
      if (error.response?.status !== 404) {
        toast.dismiss()
        toast.error(errorMessage);
      }
    }
    
    return Promise.reject(error);
  }
);

// Export the axios instance for direct use
export { api };

// API service class with typed methods
export class ApiService {
  // Generic GET request
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await api.get<ApiResponse<T>>(url, config);
    return response.data;
  }
  
  // Generic POST request
  static async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await api.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }
  
  // Generic PUT request
  static async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await api.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }
  
  // Generic PATCH request
  static async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await api.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }
  
  // Generic DELETE request
  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await api.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
  
  // Upload file with progress tracking
  static async uploadFile<T>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<T>>(url, formData, {
      ...config,
      timeout: FILE_UPLOAD_TIMEOUT, // Use longer timeout for file uploads
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    
    return response.data;
  }
}

// Export the axios instance for direct use if needed
export default api;
