import { ApiService } from './api';
import { ApiResponse } from './api';

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'user' | 'vendor';
  status?: 'approved' | 'blocked';
  loginType?: 'email' | 'google' | 'linkedin';
  isVerified?: boolean;
  sortBy?: 'createdAt' | 'firstName' | 'lastName' | 'email' | 'role';
  sortOrder?: 'asc' | 'desc';
  // Date filtering parameters
  period?: 'weekly' | 'monthly' | 'yearly';
  dateFrom?: string;
  dateTo?: string;
  // Cache invalidation parameter (not sent to backend)
  appliedAt?: number;
}

export interface RawUserData {
  _id: string;
  slug: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'vendor';
  status: 'approved' | 'blocked' | 'pending';
  avatar?: string;
  companyName?: string;
  companyEmail?: string;
  industry?: string;
  companySize?: string;
  region?: string;
  title?: string;
  description?: string;
  authProvider?: 'email' | 'google' | 'linkedin';
  isVerified?: boolean;
  acceptedTerms?: boolean;
  acceptedMarketing?: boolean;
  followersCount?: number;
  followingCount?: number;
  totalProducts?: number;
  totalDisputes?: number;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TransformedUser {
  id: number;
  _id: string; // MongoDB ID for API calls
  slug: string; // User slug for navigation
  userDetails: {
    name: string;
    email: string;
    avatar: string;
  };
  reviewPosted: number;
  approved: number;
  pending: number;
  disputed: number;
  loginType: 'Normal' | 'Google' | 'LinkedIn';
  joinedOn: string;
  status: 'Active' | 'Blocked';
  lastActivity: string;
}

export interface UsersApiResponse {
  users: TransformedUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Transform raw user data from API to match UsersTable format
 */
const transformUserData = (rawUser: RawUserData, index: number): TransformedUser => {
  // Format the joined date
  const joinedDate = new Date(rawUser.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

  // Format last activity (using updatedAt as proxy)
  const lastActivity = new Date(rawUser.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

  // Map auth provider to login type
  const loginTypeMap: Record<string, 'Normal' | 'Google' | 'LinkedIn'> = {
    'email': 'Normal',
    'google': 'Google',
    'linkedin': 'LinkedIn'
  };
  const loginType = loginTypeMap[rawUser.authProvider || 'email'] || 'Normal';

  // Map backend status to frontend status
  const statusMap: Record<string, 'Active' | 'Blocked'> = {
    'approved': 'Active',
    'blocked': 'Blocked'
  };
  const status = statusMap[rawUser.status] || 'Active';

  return {
    id: index + 1,
    _id: rawUser._id,
    slug: rawUser.slug,
    userDetails: {
      name: `${rawUser.firstName} ${rawUser.lastName}`,
      email: rawUser.email,
      avatar: rawUser.avatar || ''
    },
    reviewPosted: 0, // Placeholder - would need separate API call to get actual review count
    approved: 0, // Placeholder
    pending: 0, // Placeholder  
    disputed: rawUser.totalDisputes || 0,
    loginType,
    joinedOn: joinedDate,
    status,
    lastActivity
  };
};

/**
 * User Service Class
 */
export class UserService {
  /**
   * Get users with filtering, search, and pagination
   */
  static async getUsers(params: UserQueryParams = {}): Promise<ApiResponse<UsersApiResponse>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Filter by user role only (exclude vendors from user management)
      queryParams.append('role', params.role || 'user');
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      // Add search param
      if (params.search && params.search.trim()) {
        queryParams.append('search', params.search.trim());
      }
      
      // Add status filter
      if (params.status) {
        queryParams.append('status', params.status);
      }

      // Add login type filtering (map to authProvider for API)
      if (params.loginType) {
        queryParams.append('authProvider', params.loginType);
      }

      // Add verification filter
      if (params.isVerified !== undefined) {
        queryParams.append('isVerified', params.isVerified.toString());
      }
      
      // Add sorting params
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      // Add date filtering params
      if (params.period) {
        queryParams.append('period', params.period);
      }
      if (params.dateFrom) {
        queryParams.append('dateFrom', params.dateFrom);
      }
      if (params.dateTo) {
        queryParams.append('dateTo', params.dateTo);
      }

      const url = `/admin/users?${queryParams.toString()}`;
      console.log('Final Users API URL:', url);
      console.log('Query params received in service:', params);

      const response = await ApiService.get<RawUserData[]>(url);

      if (response.success && response.data) {
        // Get pagination from meta field
        const pagination = response.meta?.pagination || {
          page: 1,
          limit: params.limit || 10,
          total: response.data.length,
          totalPages: 1
        };

        // Transform the raw data to match UsersTable format
        const transformedUsers = response.data.map((user, index) => 
          transformUserData(user, (pagination.page - 1) * pagination.limit + index)
        );

        return {
          success: true,
          data: {
            users: transformedUsers,
            pagination: {
              page: pagination.page || pagination.currentPage || 1,
              limit: pagination.limit || pagination.itemsPerPage || 10,
              total: pagination.total || pagination.totalItems || response.data.length,
              totalPages: pagination.totalPages || Math.ceil((pagination.total || response.data.length) / (pagination.limit || 10))
            }
          },
          message: response.message
        };
      }

      throw new Error(response.message || 'Failed to fetch users');
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Block a user
   */
  static async blockUser(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await ApiService.patch(`/admin/users/${userId}/block`);
      return response;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  }

  /**
   * Unblock a user
   */
  static async unblockUser(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await ApiService.patch(`/admin/users/${userId}/unblock`);
      return response;
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  }

  /**
   * Delete a user
   */
  static async deleteUser(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await ApiService.delete(`/admin/users/${userId}`);
      return response;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Verify a user
   */
  static async verifyUser(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await ApiService.patch(`/admin/users/${userId}/verify`);
      return response;
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<ApiResponse<RawUserData>> {
    try {
      const response = await ApiService.get<RawUserData>(`/admin/users/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Get user profile statistics
   */
  static async getUserProfileStats(userId: string): Promise<ApiResponse<{
    reviewsWritten: number;
    totalReviews: number;
    approved: number;
    pending: number;
    disputed: number;
    followers: number;
    following: number;
    badges?: any[];
  }>> {
    try {
      const response = await ApiService.get(`/admin/users/${userId}/profile-stats`);
      return response;
    } catch (error) {
      console.error('Error fetching user profile stats:', error);
      throw error;
    }
  }

  /**
   * Get user reviews with pagination
   */
  static async getUserReviews(userId: string, options?: {
    page?: number;
    limit?: number;
    status?: 'all' | 'approved' | 'pending' | 'disputed';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{
    reviews: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    try {
      const params = new URLSearchParams();
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.status && options.status !== 'all') params.append('status', options.status);
      if (options?.sortBy) params.append('sortBy', options.sortBy);
      if (options?.sortOrder) params.append('sortOrder', options.sortOrder);
      
      const queryString = params.toString();
      const response = await ApiService.get(`/admin/users/${userId}/reviews${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  }

  /**
   * Get user by slug (same endpoint as vendors)
   */
  static async getUserBySlug(slug: string): Promise<ApiResponse<RawUserData>> {
    try {
      const response = await ApiService.get<RawUserData>(`/admin/users/slug/${slug}`);
      return response;
    } catch (error) {
      console.error('Error fetching user by slug:', error);
      throw error;
    }
  }

  /**
   * Get user profile statistics by slug (same endpoint as vendors)
   */
  static async getUserProfileStatsBySlug(slug: string): Promise<ApiResponse<{
    reviewsWritten: number;
    totalReviews: number;
    approved: number;
    pending: number;
    disputed: number;
    followers: number;
    following: number;
    badges?: any[];
  }>> {
    try {
      const response = await ApiService.get(`/admin/users/slug/${slug}/profile-stats`);
      return response;
    } catch (error) {
      console.error('Error fetching user profile stats by slug:', error);
      throw error;
    }
  }

  /**
   * Get user reviews by slug with pagination (same endpoint as vendors)
   */
  static async getUserReviewsBySlug(slug: string, options?: {
    page?: number;
    limit?: number;
    status?: 'all' | 'approved' | 'pending' | 'disputed';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{
    reviews: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    try {
      const params = new URLSearchParams();
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.status && options.status !== 'all') params.append('status', options.status);
      if (options?.sortBy) params.append('sortBy', options.sortBy);
      if (options?.sortOrder) params.append('sortOrder', options.sortOrder);
      
      const queryString = params.toString();
      const response = await ApiService.get(`/admin/users/slug/${slug}/reviews${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching user reviews by slug:', error);
      throw error;
    }
  }
} 