import { ApiService, ApiResponse, tokenStorage } from './api';

// User interface
export interface User {
  id: string;
  _id?: string;
  accessToken?: string;
  displayName?: string;
  firstName: string;
  lastName: string;
  slug?: string;
  email: string;
  role?: 'user' | 'vendor';
  userType?: 'user' | 'vendor';
  companyName?: string;
  companyEmail?: string;
  industry?: string;
  companySize?: string;
  description?: string;
  region?: string;
  title?: string;
  websiteUrl?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
  avatar?: string;
  // Vendor-specific fields
  companyAvatar?: string;
  yearFounded?: string;
  hqLocation?: string;
  companyDescription?: string;
  companyWebsiteUrl?: string;
  isVerified?: boolean;
  authProvider?: 'email' | 'google' | 'linkedin';
  acceptedTerms?: boolean;
  acceptedMarketing?: boolean;
  followers?: number;
  following?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Auth response interface
export interface AuthResponse {
  user: User;
  token?: string; // Make token optional as it might be in user.accessToken
}

// Login request interface
export interface LoginRequest {
  email: string;
  password: string;
}

// User registration request interface
export interface UserRegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
  acceptedMarketing?: boolean;
}

// Vendor registration request interface
export interface VendorRegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
  companyEmail: string;
  industry: string;
  companySize: string;
  acceptedTerms: boolean;
  acceptedMarketing?: boolean;
}

// Forgot password request interface
export interface ForgotPasswordRequest {
  email: string;
}

// Reset password request interface
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Verify reset token request interface
export interface VerifyResetTokenRequest {
  token: string;
}

// Change password request interface
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Profile update request interface
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  companyEmail?: string;
  industry?: string;
  companySize?: string;
  description?: string;
  region?: string;
  title?: string;
  websiteUrl?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
  avatar?: string;
  companyAvatar?: string;
  companyDescription?: string;
  companyWebsiteUrl?: string;
  yearFounded?: string;
  hqLocation?: string;
}

// Auth service class
export class AuthService {
  // Expose tokenStorage for external use
  static tokenStorage = tokenStorage;

  // User registration
  static async registerUser(data: UserRegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await ApiService.post<AuthResponse>('/auth/register', data);
    if (response.success && response.data) {
      // Extract token from user object or response
      const token = response.data.user?.accessToken || response.data.token;
      if (token) {
        tokenStorage.setToken(token);
      }
    }
    return response;
  }

  // Vendor registration
  static async registerVendor(data: VendorRegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await ApiService.post<AuthResponse>('/auth/register-vendor', data);
    if (response.success && response.data) {
      // Extract token from user object or response
      const token = response.data.user?.accessToken || response.data.token;
      if (token) {
        tokenStorage.setToken(token);
      }
    }
    return response;
  }

  // User login
  static async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await ApiService.post<AuthResponse>('/auth/login', data);
    if (response.success && response.data) {
      // Extract token from user object or response
      const token = response.data.user?.accessToken || response.data.token;
      if (token) {
        tokenStorage.setToken(token);
      }
    }
    return response;
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await ApiService.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
    } finally {
      // Always clear local tokens
      tokenStorage.removeToken();
    }
  }

  // Forgot password
  static async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<null>> {
    return await ApiService.post<null>('/auth/forgot-password', data);
  }

  // Reset password
  static async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<null>> {
    return await ApiService.post<null>('/auth/reset-password', data);
  }

  // Verify reset token
  static async verifyResetToken(data: VerifyResetTokenRequest): Promise<ApiResponse<null>> {
    return await ApiService.post<null>('/auth/verify-reset-token', data);
  }

  // Get current user profile
  static async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return await ApiService.get<{ user: User }>('/users/profile');
  }

  // Update user profile
  static async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<{ user: User }>> {
    return await ApiService.patch<{ user: User }>('/users/profile', data);
  }

  // Change password
  static async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {
    return await ApiService.patch<null>('/users/change-password', data);
  }

  // Get public profile
  static async getPublicProfile(userId: string): Promise<ApiResponse<{ user: User }>> {
    return await ApiService.get<{ user: User }>(`/users/public-profile/${userId}`);
  }

  // Get user reviews
  static async getUserReviews(userId: string, options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{
    reviews: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    total: number;
  }>> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder);
    
    const queryString = params.toString();
    return await ApiService.get(`/users/${userId}/reviews${queryString ? `?${queryString}` : ''}`);
  }

  // Get user profile statistics
  static async getUserProfileStats(userId: string): Promise<ApiResponse<{
    reviewsWritten: number;
    disputes: number;
    followers: number;
    following: number;
    products?: number;
    badges?: any[];
  }>> {
    return await ApiService.get(`/users/${userId}/profile-stats`);
  }

  // Social login URLs
  static getGoogleLoginUrl(role: 'user' | 'vendor' = 'user'): string {
    const baseUrl = `${(import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1'}/auth/google`;
    return `${baseUrl}?role=${role}`;
  }

  static getLinkedInLoginUrl(role: 'user' | 'vendor' = 'user'): string {
    const baseUrl = `${(import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1'}/auth/linkedin`;
    return `${baseUrl}?role=${role}`;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!tokenStorage.getToken();
  }

  // Get current token
  static getToken(): string | null {
    return tokenStorage.getToken();
  }

  // Get public profile by slug
  static async getPublicProfileBySlug(slug: string): Promise<ApiResponse<{ user: User }>> {
    return await ApiService.get<{ user: User }>(`/users/public-profile/slug/${slug}`);
  }

  // Get user reviews by slug
  static async getUserReviewsBySlug(slug: string, options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{
    reviews: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    total: number;
  }>> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder);
    
    const queryString = params.toString();
    return await ApiService.get(`/users/slug/${slug}/reviews${queryString ? `?${queryString}` : ''}`);
  }

  // Get user profile statistics by slug
  static async getUserProfileStatsBySlug(slug: string): Promise<ApiResponse<{
    reviewsWritten: number;
    disputes: number;
    followers: number;
    following: number;
    products?: number;
  }>> {
    return await ApiService.get(`/users/slug/${slug}/profile-stats`);
  }
}

export default AuthService; 