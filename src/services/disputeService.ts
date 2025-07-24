import { ApiService } from './api';
import { ApiResponse } from './api';

export interface DisputeQueryParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'resolved' | 'all';
  sortBy?: 'createdAt' | 'updatedAt' | 'status';
  sortOrder?: 'asc' | 'desc';
  productSlug?: string;
}

export interface RawDisputeData {
  _id: string;
  review: {
    _id: string;
    title: string;
    content: string;
    overallRating: number;
    reviewer: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      companyName?: string;
      companySize?: string;
      title?: string;
      slug?: string;
    };
    createdAt: string;
  };
  vendor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  product: {
    _id: string;
    name: string;
    slug: string;
    isActive: boolean;
    logoUrl?: string;
    createdAt: string;
  };
  reason: 'false-or-misleading-information' | 'spam-or-fake-review' | 'inappropriate-content' | 'conflict-of-interest' | 'other';
  description: string;
  explanations?: Array<{
    _id: string;
    content: string;
    author: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    createdAt: string;
    updatedAt?: string;
  }>;
  status: 'active' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface DisputesApiResponse {
  disputes: RawDisputeData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Dispute Service Class
 */
export class DisputeService {
  /**
   * Get all disputes (admin only)
   */
  static async getAllDisputes(params: DisputeQueryParams = {}): Promise<ApiResponse<DisputesApiResponse>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      // Add status filter
      if (params.status && params.status !== 'all') {
        queryParams.append('status', params.status);
      }
      
      // Add sorting params
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      // Add product slug filter
      if (params.productSlug) queryParams.append('productSlug', params.productSlug);

      const url = `/disputes/all?${queryParams.toString()}`;
      console.log('Disputes API URL:', url);

      const response = await ApiService.get<any>(url);

      // Handle response
      if (response.success && response.data) {
        const disputes = Array.isArray(response.data) ? response.data : [];
        
        // Pagination is in meta
        const paginationData = response.meta || {
          currentPage: params.page || 1,
          totalPages: 1,
          totalItems: disputes.length,
          itemsPerPage: params.limit || 10,
          hasNextPage: false,
          hasPrevPage: false
        };

        return {
          success: true,
          data: {
            disputes,
            pagination: paginationData
          },
          message: response.message
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to fetch disputes'
      };
    } catch (error) {
      console.error('Error in DisputeService.getAllDisputes:', error);
      throw error;
    }
  }

  /**
   * Get dispute by review ID (find dispute for a specific review)
   */
  static async getDisputeByReviewId(reviewId: string): Promise<ApiResponse<RawDisputeData | null>> {
    try {
      // Get all disputes and filter by review ID on frontend
      // Since there's no specific endpoint for getting dispute by review ID
      const response = await this.getAllDisputes({ limit: 5 }); // Get more disputes to find the one
      
      if (response.success && response.data) {
        const dispute = response.data.disputes.find(d => d.review._id === reviewId);
        return {
          success: true,
          data: dispute || null,
          message: dispute ? 'Dispute found' : 'No dispute found for this review'
        };
      }

      return {
        success: false,
        message: 'Failed to fetch dispute information'
      };
    } catch (error) {
      console.error('Error in DisputeService.getDisputeByReviewId:', error);
      throw error;
    }
  }

  /**
   * Update dispute status (resolve dispute) - Admin route
   */
  static async updateDispute(disputeId: string, updateData: { status?: 'active' | 'resolved', reason?: string, description?: string }): Promise<ApiResponse<any>> {
    try {
      const response = await ApiService.put(`/admin/disputes/${disputeId}`, updateData);
      return response;
    } catch (error) {
      console.error('Error updating dispute:', error);
      throw error;
    }
  }

  /**
   * Delete dispute
   */
  static async deleteDispute(disputeId: string): Promise<ApiResponse<any>> {
    try {
      const response = await ApiService.delete(`/disputes/${disputeId}`);
      return response;
    } catch (error) {
      console.error('Error deleting dispute:', error);
      throw error;
    }
  }
} 