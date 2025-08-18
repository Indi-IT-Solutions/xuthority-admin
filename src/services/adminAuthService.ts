import { ApiService, ApiResponse, tokenStorage } from './api';

// Admin interface
export interface Admin {
  id: string;
  _id?: string;
  accessToken?: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: 'admin';
  isActive?: boolean;
  lastLogin?: string;
  notes?: string;
  fullName?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Admin auth response interface
export interface AdminAuthResponse {
  admin: Admin;
  token?: string;
}

// Admin login request interface
export interface AdminLoginRequest {
  email: string;
  password: string;
}

// Admin forgot password request interface
export interface AdminForgotPasswordRequest {
  email: string;
}

// Admin reset password request interface
export interface AdminResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Admin verify reset token request interface
export interface AdminVerifyResetTokenRequest {
  token: string;
}

// Admin change password request interface
export interface AdminChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Admin profile update request interface
export interface AdminUpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  notes?: string;
  avatar?: string;
}

// Admin auth service class
export class AdminAuthService {
  // Expose tokenStorage for external use
  static tokenStorage = tokenStorage;

  // Admin login
  static async login(data: AdminLoginRequest): Promise<ApiResponse<AdminAuthResponse>> {
    const response = await ApiService.post<AdminAuthResponse>('/admin/auth/login', data);
    if (response.success && response.data) {
      // Extract token from admin object or response
      const token = response.data.admin?.accessToken || response.data.token;
      if (token) {
        tokenStorage.setToken(token);
      }
    }
    return response;
  }

  // Admin logout
  static async logout(): Promise<void> {
    try {
      // Call logout endpoint if available (admin-specific)
      await ApiService.post('/admin/auth/logout');
    } catch (error) {
      // Ignore errors on logout
    } finally {
      // Always clear local tokens
      tokenStorage.removeToken();
    }
  }

  // Admin forgot password
  static async forgotPassword(data: AdminForgotPasswordRequest): Promise<ApiResponse<null>> {
    return await ApiService.post<null>('/admin/auth/forgot-password', data);
  }

  // Admin reset password
  static async resetPassword(data: AdminResetPasswordRequest): Promise<ApiResponse<null>> {
    return await ApiService.post<null>('/admin/auth/reset-password', data);
  }

  // Admin verify reset token
  static async verifyResetToken(data: AdminVerifyResetTokenRequest): Promise<ApiResponse<{
    adminId: string;
    firstName: string;
    lastName: string;
    email: string;
    expiresAt: string;
  }>> {
    return await ApiService.post('/admin/auth/verify-reset-token', data);
  }

  // Get current admin profile
  static async getProfile(): Promise<ApiResponse<{ admin: Admin }>> {
    return await ApiService.get<{ admin: Admin }>('/admin/me');
  }

  // Update admin profile
  static async updateProfile(data: AdminUpdateProfileRequest): Promise<ApiResponse<{ admin: Admin }>> {
    return await ApiService.patch<{ admin: Admin }>('/admin/profile', data);
  }

  // Update admin profile with image
  static async updateProfileWithImage(data: AdminUpdateProfileRequest, imageFile?: File): Promise<ApiResponse<{ admin: Admin }>> {
    if (imageFile) {
      const formData = new FormData();
      
      // Add profile data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      
      // Add image file
      formData.append('avatar', imageFile);
      
      return await ApiService.patch<{ admin: Admin }>('/admin/profile', formData);
    } else {
      // If no image, use regular update
      return await this.updateProfile(data);
    }
  }

  // Change admin password
  static async changePassword(data: AdminChangePasswordRequest): Promise<ApiResponse<null>> {
    return await ApiService.patch<null>('/admin/change-password', data);
  }

  // Get admin dashboard analytics with time filtering
  static async getDashboardAnalytics(options?: {
    period?: 'weekly' | 'monthly' | 'yearly';
  }): Promise<ApiResponse<{
    stats: {
      totalUsers: number;
      totalVendors: number;
      totalReviews: number;
      pendingVendors: number;
    };
    charts: {
      userGrowth: Array<{
        period: string;
        users: number;
        vendors: number;
      }>;
      reviewTrends: Array<{
        period: string;
        total: number;
        approved: number;
        pending: number;
        rejected: number;
        dispute: number;
      }>;
    };
    recentReviews: Array<{
      _id: string;
      title: string;
      content: string;
      overallRating: number;
      status: 'pending' | 'approved' | 'rejected' | 'dispute';
      submittedAt: string;
      totalReplies?: number;
      reviewer: {
        name: string;
        firstName?: string;
        lastName?: string;
        avatar: string;
        email: string;
        slug?: string;
        companyName?: string;
        isVerified?: boolean;
      };
      product: {
        name: string;
        slug: string;
        logoUrl: string;
        userId?: {
          _id?: string;
          id?: string;
          firstName: string;
          lastName: string;
          email: string;
          avatar: string;
          slug?: string;
          companyName?: string;
        };
      };
    }>;
  }>> {
    const params = new URLSearchParams();
    if (options?.period) {
      params.append('period', options.period);
    }
    
    const queryString = params.toString();
    return await ApiService.get(`/admin/analytics${queryString ? `?${queryString}` : ''}`);
  }

  // Get all users with admin filtering
  static async getUsers(options?: {
    page?: number;
    limit?: number;
    role?: 'user' | 'vendor';
    isVerified?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.role) params.append('role', options.role);
    if (options?.isVerified !== undefined) params.append('isVerified', options.isVerified.toString());
    if (options?.search) params.append('search', options.search);
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder);
    
    const queryString = params.toString();
    return await ApiService.get(`/admin/users${queryString ? `?${queryString}` : ''}`);
  }

  // Verify vendor profile
  static async verifyVendorProfile(userId: string): Promise<ApiResponse<{ user: any }>> {
    return await ApiService.patch<{ user: any }>(`/admin/users/${userId}/verify`);
  }

  // Check if admin is authenticated
  static isAuthenticated(): boolean {
    return !!tokenStorage.getToken();
  }

  // Get current token
  static getToken(): string | null {
    return tokenStorage.getToken();
  }
}

export default AdminAuthService; 