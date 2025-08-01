import { ApiService } from './api';
import { ApiResponse } from './api';

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'published' | 'pending' | 'disputed';
  rating?: number;
  period?: 'weekly' | 'monthly' | 'yearly';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'rating' | 'reviewer' | 'product';
  sortOrder?: 'asc' | 'desc';
  appliedAt?: number;
  // Add admin flag to bypass default status filtering
  isAdminRequest?: boolean;
}

export interface RawReviewData {
  _id: string;
  title: string;
  content: string;
  overallRating: number;
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'dispute';
  submittedAt: string;
  reviewer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    slug?: string;
    isVerified?: boolean;
    companyName?: string;
    companySize?: string;
    industry?: string | { _id: string; name: string; slug: string };
    title?: string;
    id: string;
  };
  product: {
    _id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    brandColors?: string;
    totalReviews?: number;
    avgRating?: number;
    isFavorite?: boolean;
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      slug?: string;
      email?: string;
      companyName?: string;
      industry?: string | { _id: string; name: string; slug: string };
      id: string;
    };
    id: string;
  };
  // Sub-ratings for different aspects (0 = N/A, 1-7 = actual ratings)
  subRatings?: {
    easeOfUse?: number;
    customerSupport?: number;
    features?: number;
    pricing?: number;
    technicalSupport?: number;
  };
  // Verification Status
  verification?: {
    isVerified?: boolean;
    verificationType?: 'company_email' | 'linkedin' | 'vendor_invite' | 'screenshot';
    verificationData?: any;
    verifiedAt?: string;
  };
  comments?: number;
  createdAt: string;
  updatedAt: string;
  // Optional dispute information if review is disputed
  dispute?: {
    _id: string;
    reason: 'false-or-misleading-information' | 'spam-or-fake-review' | 'inappropriate-content' | 'conflict-of-interest' | 'other';
    description: string;
    status: 'active' | 'resolved';
    vendor: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    createdAt: string;
  };
}

export interface TransformedReview {
  id: number;
  _id: string;
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    slug?: string;
    companyName?: string;
    isVerified?: boolean;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    totalReviews?: number;
    avgRating?: number;
    userId: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatar: string;
      slug?: string;
      companyName?: string;
    };
  };
  review: string;
  rating: number;
  comments: number;
  date: string;
  status: 'Published' | 'Pending' | 'Disputed';
}

export interface ReviewsApiResponse {
  reviews: TransformedReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

/**
 * Transform raw API review data to UI format
 */
export const transformReviewData = (rawReview: RawReviewData, index: number): TransformedReview => {
  // Map API status to UI status
  const statusMap: Record<string, 'Published' | 'Pending' | 'Disputed'> = {
    'approved': 'Published',
    'pending': 'Pending',
    'rejected': 'Pending',
    'flagged': 'Disputed',
    'dispute': 'Disputed'
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };




  return {
    id: index + 1,
    _id: rawReview._id,
    reviewer: {
      id: rawReview.reviewer?._id || rawReview.reviewer?.id || '',
      firstName: rawReview.reviewer?.firstName || '',
      lastName: rawReview.reviewer?.lastName || '',
      email: rawReview.reviewer?.email || '',
      avatar: rawReview.reviewer?.avatar || '',
      slug: rawReview.reviewer?.slug || '',
      companyName: rawReview.reviewer?.companyName || '',
      isVerified: rawReview.reviewer?.isVerified || false
    },
    product: {
      id: rawReview.product?._id || rawReview.product?.id || '',
      name: rawReview.product?.name || 'Unknown Product',
      slug: rawReview.product?.slug || '',
      logo: rawReview.product?.logoUrl || '',
      totalReviews: rawReview.product?.totalReviews || 0,
      avgRating: rawReview.product?.avgRating || 0,
      userId: {
        id: rawReview.product?.userId?._id || rawReview.product?.userId?.id || '',
        firstName: rawReview.product?.userId?.firstName || '',
        lastName: rawReview.product?.userId?.lastName || '',
        email: rawReview.product?.userId?.email || '',
        avatar: rawReview.product?.userId?.avatar || '',
        slug: rawReview.product?.userId?.slug || '',
        companyName: rawReview.product?.userId?.companyName || ''
      }
    },
    review: rawReview.content || rawReview.title || '',
    rating: rawReview.overallRating || 0,
    comments: rawReview.comments || 0,
    date: formatDate(rawReview.submittedAt || rawReview.createdAt),
    status: statusMap[rawReview.status] || 'Pending'
  };
};

/**
 * Review Service Class
 */
export class ReviewService {
  /**
   * Get all reviews for admin (combines multiple status requests)
   */
  static async getAllReviewsForAdmin(params: ReviewQueryParams = {}): Promise<ApiResponse<ReviewsApiResponse>> {
    try {
console.log('params', params)

      return this.getReviews(params);
    } catch (error) {
      console.error('Error in getAllReviewsForAdmin:', error);
      throw error;
    }
  }

  /**
   * Get reviews with filtering, search, and pagination
   * Uses the existing /product-reviews endpoint
   */
  static async getReviews(params: ReviewQueryParams = {}): Promise<ApiResponse<ReviewsApiResponse>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      // Add search param
      if (params.search && params.search.trim()) {
        queryParams.append('search', params.search.trim());
      }
      
      // Add status filter - map UI status to API status  
      if (params.status) {
        const statusMap: Record<string, string> = {
          'all': 'all',
          'published': 'approved',
          'pending': 'pending',
          'disputed': 'dispute'
        };
        queryParams.append('status', statusMap[params.status] || params.status);
      }
      // Note: When status is 'all', we don't send any status parameter
      // This should make the backend use its default, but we need backend support for admin requests

      // Add rating filter
      if (params.rating !== undefined && params.rating !== null) {
        queryParams.append('overallRating', params.rating.toString());
      }
      
      // Add sorting params
      if (params.sortBy) {
        // Map UI sortBy to backend fields
        const sortByMap: Record<string, string> = {
          'createdAt': 'submittedAt',
          'rating': 'overallRating',
          'reviewer': 'reviewer',
          'product': 'product'
        };
        queryParams.append('sortBy', sortByMap[params.sortBy] || params.sortBy);
      }
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      // Add admin flag for admin requests (to get all reviews regardless of status)
      if (params.isAdminRequest) {
        queryParams.append('isAdminRequest', 'true');
      }

      const url = `/product-reviews?${queryParams.toString()}`;
      console.log('Final Reviews API URL:', url);
      console.log('Query params received in service:', params);

      const response = await ApiService.get<any>(url);

      // Handle response and transform data
      if (response.success && response.data) {
        // Reviews are directly in the data array
        const rawReviews = Array.isArray(response.data) ? response.data : [];
        
        const transformedReviews = rawReviews.map((review, index) => transformReviewData(review, index));

        // Pagination is in meta.pagination
        const paginationData = response.meta?.pagination || {
          currentPage: params.page || 1,
          totalPages: 1,
          totalItems: transformedReviews.length,
          itemsPerPage: params.limit || 10,
          hasNext: false,
          hasPrev: false,
          total: transformedReviews.length
        };

        return {
          success: true,
          data: {
            reviews: transformedReviews,
            pagination: {
              page: paginationData.currentPage,
              limit: paginationData.itemsPerPage,
              total: paginationData.totalItems || paginationData.total,
              totalPages: paginationData.totalPages,
              hasNext: paginationData.hasNext,
              hasPrev: paginationData.hasPrev
            }
          },
          message: response.message
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to fetch reviews'
      };
    } catch (error) {
      console.error('Error in ReviewService.getReviews:', error);
      throw error;
    }
  }

  /**
   * Get a specific review by ID
   */
  static async getReviewById(reviewId: string): Promise<ApiResponse<RawReviewData>> {
    try {
      const response = await ApiService.get<RawReviewData>(`/product-reviews/${reviewId}`);
      return response;
    } catch (error) {
      console.error('Error fetching review by ID:', error);
      throw error;
    }
  }

  /**
   * Approve a review (using moderation endpoint)
   */
  static async approveReview(reviewId: string): Promise<ApiResponse<any>> {
    try {
      const response = await ApiService.patch(`/product-reviews/${reviewId}/moderate`, {
        status: 'approved'
      });
      return response;
    } catch (error) {
      console.error('Error approving review:', error);
      throw error;
    }
  }

  /**
   * Reject a review (using moderation endpoint)
   */
  static async rejectReview(reviewId: string): Promise<ApiResponse<any>> {
    try {
      const response = await ApiService.patch(`/product-reviews/${reviewId}/moderate`, {
        status: 'rejected'
      });
      return response;
    } catch (error) {
      console.error('Error rejecting review:', error);
      throw error;
    }
  }

  /**
   * Delete a review
   */
  static async deleteReview(reviewId: string): Promise<ApiResponse<any>> {
    try {
      const response = await ApiService.delete(`/admin/product-reviews/${reviewId}`);
      return response;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  /**
   * Resolve a disputed review (mark as approved)
   */
  static async resolveDispute(reviewId: string): Promise<ApiResponse<any>> {
    try {
      const response = await ApiService.patch(`/product-reviews/${reviewId}/moderate`, {
        status: 'approved',
        moderationNote: 'Dispute resolved by admin'
      });
      return response;
    } catch (error) {
      console.error('Error resolving dispute:', error);
      throw error;
    }
  }

  /**
   * Bulk delete reviews
   * Note: Backend doesn't have bulk delete, so we'll delete one by one
   */
  static async bulkDeleteReviews(reviewIds: string[]): Promise<ApiResponse<any>> {
    try {
      const deletePromises = reviewIds.map(id => 
        ApiService.delete(`/product-reviews/${id}`)
      );
      
      const results = await Promise.allSettled(deletePromises);
      
      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');
      
      return {
        success: true,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: reviewIds.length
        },
        message: `Successfully deleted ${successful.length} of ${reviewIds.length} reviews`
      };
    } catch (error) {
      console.error('Error bulk deleting reviews:', error);
      throw error;
    }
  }

  /**
   * Get review statistics
   * Note: This endpoint doesn't exist in backend, return mock data for now
   */
  static async getReviewStats(): Promise<ApiResponse<{
    total: number;
    published: number;
    pending: number;
    disputed: number;
    avgRating: number;
  }>> {
    try {
      // Since there's no specific stats endpoint, we could call the general endpoint
      // and calculate stats, but for now return mock data
      return {
        success: true,
        data: {
          total: 0,
          published: 0,
          pending: 0,
          disputed: 0,
          avgRating: 0
        },
        message: 'Review statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching review stats:', error);
      throw error;
    }
  }
}
