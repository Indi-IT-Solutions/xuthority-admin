import { ApiService } from './api';
import { ApiResponse } from '../types/api';

export interface VendorQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'approved' | 'pending' | 'blocked' | 'approved,blocked'; // Support single status or combined for approved tab
  sortBy?: 'createdAt' | 'firstName' | 'lastName' | 'email' | 'role';
  sortOrder?: 'asc' | 'desc';
  // Date filtering parameters
  period?: 'weekly' | 'monthly' | 'yearly';
  dateFrom?: string;
  dateTo?: string;
  // Cache invalidation parameter (not sent to backend)
  appliedAt?: number;
}

export interface RawVendorData {
  _id: string;
  firstName: string;
  lastName: string;
  slug?: string;
  email: string;
  avatar?: string;
  region?: string;
  description?: string;
  companyName?: string;
  companyEmail?: string;
  companyAvatar?: string;
  companyDescription?: string;
  companyWebsiteUrl?: string;
  industry?: string;
  companySize?: string;
  yearFounded?: string;
  hqLocation?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
  followersCount?: number;
  followingCount?: number;
  role: 'vendor';
  isVerified: boolean;
  status: 'approved' | 'pending' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface TransformedVendor {
  id: number;
  _id?: string; // MongoDB ID for API calls
  slug?: string; // User slug for navigation
  company: {
    name: string;
    email: string;
    logo: string;
  };
  owner: {
    name: string;
    email: string;
    avatar: string;
  };
  industry: string;
  companySize: string;
  joinedOn: string;
  status: 'Active' | 'Blocked' | 'Pending';
}

export interface VendorsApiResponse {
  vendors: TransformedVendor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VendorBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: string;
}

export interface VendorProfileStats {
  totalReviews: number;
  averageRating: number;
  disputes: number;
  totalProducts: number;
  followers: number;
  following: number;
  badges: VendorBadge[];
}

export interface VendorProduct {
  id: number;
  _id: string;
  name: string;
  logo: string;
  industry: string;
  marketSegments: string;
  avgRating: number;
  totalReviews: number;
  createdAt: string;
}

export interface VendorProductsResponse {
  products: VendorProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VendorProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'name' | 'avgRating' | 'totalReviews';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Transform raw vendor data from API to match VendorsTable format
 */
const transformVendorData = (rawVendor: RawVendorData, index: number): TransformedVendor => {
  // Format the joined date
  const joinedDate = new Date(rawVendor.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

  // Map backend status to frontend status
  const statusMap: Record<string, 'Active' | 'Blocked' | 'Pending'> = {
    'approved': 'Active',
    'blocked': 'Blocked',
    'pending': 'Pending'
  };
  const status = statusMap[rawVendor.status] || 'Pending';

  return {
    id: index + 1, // Using index as ID since VendorsTable expects number
    _id: rawVendor._id, // Add the actual MongoDB ID for API calls
    slug: rawVendor.slug, // Add the slug for navigation
    company: {
      name: rawVendor.companyName || 'Unknown Company',
      email: rawVendor.companyEmail || rawVendor.email,
      logo: rawVendor.companyAvatar || ''
    },
    owner: {
      name: `${rawVendor.firstName} ${rawVendor.lastName}`,
      email: rawVendor.email,
      avatar: rawVendor.avatar || ''
    },
    industry: rawVendor.industry || 'Not specified',
    companySize: rawVendor.companySize || 'Not specified',
    joinedOn: joinedDate,
    status
  };
};

/**
 * Vendor Service Class
 */
export class VendorService {
  /**
   * Get vendors with filtering, search, and pagination
   */
  static async getVendors(params: VendorQueryParams = {}): Promise<ApiResponse<VendorsApiResponse>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Always filter by vendor role
      queryParams.append('role', 'vendor');
      
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
      console.log('Final API URL:', url);
      console.log('Query params received in service:', params);

      const response = await ApiService.get<RawVendorData[]>(url);

      // Debug logging to see actual response structure (remove in production)
      // console.log('API Response:', response);
      // console.log('Response data:', response.data);
      // console.log('Response meta:', response.meta);

      if (response.success && response.data) {
        // Get pagination from meta field
        const pagination = response.meta?.pagination || {
          page: 1,
          limit: params.limit || 10,
          total: response.data.length,
          totalPages: 1
        };

        // Transform the raw data to match VendorsTable format
        const transformedVendors = response.data.map((vendor, index) => 
          transformVendorData(vendor, (pagination.page - 1) * pagination.limit + index)
        );

        return {
          success: true,
          data: {
            vendors: transformedVendors,
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

      throw new Error(response.message || 'Failed to fetch vendors');
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  }

  /**
   * Verify a vendor (approve) - Legacy endpoint
   */
  static async verifyVendor(vendorId: string): Promise<ApiResponse<{ user: RawVendorData }>> {
    try {
      return await ApiService.patch(`/admin/users/${vendorId}/verify`);
    } catch (error) {
      console.error('Error verifying vendor:', error);
      throw error;
    }
  }

  /**
   * Approve a vendor
   */
  static async approveVendor(vendorId: string): Promise<ApiResponse<{ user: RawVendorData }>> {
    try {
      return await ApiService.patch(`/admin/users/${vendorId}/approve`);
    } catch (error) {
      console.error('Error approving vendor:', error);
      throw error;
    }
  }

  /**
   * Reject a vendor
   */
  static async rejectVendor(vendorId: string, reason?: string): Promise<ApiResponse<{ user: RawVendorData }>> {
    try {
      const payload = reason ? { reason } : {};
      return await ApiService.patch(`/admin/users/${vendorId}/reject`, payload);
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      throw error;
    }
  }

  /**
   * Block a vendor
   */
  static async blockVendor(vendorId: string): Promise<ApiResponse<{ user: RawVendorData }>> {
    try {
      return await ApiService.patch(`/admin/users/${vendorId}/block`);
    } catch (error) {
      console.error('Error blocking vendor:', error);
      throw error;
    }
  }

  /**
   * Unblock a vendor
   */
  static async unblockVendor(vendorId: string): Promise<ApiResponse<{ user: RawVendorData }>> {
    try {
      return await ApiService.patch(`/admin/users/${vendorId}/unblock`);
    } catch (error) {
      console.error('Error unblocking vendor:', error);
      throw error;
    }
  }

  /**
   * Delete a vendor
   */
  static async deleteVendor(vendorId: string): Promise<ApiResponse<{ user: any }>> {
    try {
      return await ApiService.delete(`/admin/users/${vendorId}`);
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }

  /**
   * Bulk delete vendors (this would need to be implemented in backend)
   */
  static async bulkDeleteVendors(vendorIds: string[]): Promise<ApiResponse<any>> {
    try {
      // This endpoint would need to be implemented in the backend
      return await ApiService.post(`/admin/users/bulk-delete`, { userIds: vendorIds });
    } catch (error) {
      console.error('Error bulk deleting vendors:', error);
      throw error;
    }
  }

  /**
   * Get vendor details by slug
   */
  static async getVendorBySlug(slug: string): Promise<ApiResponse<RawVendorData>> {
    try {
      const response = await ApiService.get<RawVendorData>(`/admin/users/slug/${slug}`);
      
      if (response.success && response.data) {
        return response;
      }

      throw new Error(response.message || 'Failed to fetch vendor details');
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      throw error;
    }
  }

  /**
   * Get vendor profile statistics by slug
   */
  static async getVendorProfileStatsBySlug(slug: string): Promise<ApiResponse<VendorProfileStats>> {
    try {
      const response = await ApiService.get<VendorProfileStats>(`/admin/users/slug/${slug}/profile-stats`);
      
      if (response.success && response.data) {
        return response;
      }

      throw new Error(response.message || 'Failed to fetch vendor profile stats');
    } catch (error) {
      console.error('Error fetching vendor profile stats:', error);
      throw error;
    }
  }

  /**
   * Get vendor products by user ID (using existing products API)
   */
  static async getVendorProducts(userId: string, params: VendorProductQueryParams = {}): Promise<ApiResponse<VendorProductsResponse>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      // Add search param
      if (params.search && params.search.trim()) {
        queryParams.append('search', params.search.trim());
      }
      
      // Add sorting params
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `/products/user/${userId}?${queryParams.toString()}`;
      const response = await ApiService.get<VendorProduct[]>(url);

      if (response.success && response.data) {
        // Get pagination from meta field
        const pagination = response.meta?.pagination || {
          page: 1,
          limit: params.limit || 5,
          total: response.data.length,
          totalPages: 1
        };

        return {
          success: true,
          data: {
            products: response.data,
            pagination: {
              page: pagination.page || pagination.currentPage || 1,
              limit: pagination.limit || pagination.itemsPerPage || 5,
              total: pagination.total || pagination.totalItems || response.data.length,
              totalPages: pagination.totalPages || Math.ceil((pagination.total || response.data.length) / (pagination.limit || 5))
            }
          },
          message: response.message
        };
      }

      throw new Error(response.message || 'Failed to fetch vendor products');
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      throw error;
    }
  }
}

export default VendorService; 