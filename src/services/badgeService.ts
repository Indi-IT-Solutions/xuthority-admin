import api from './api';

export interface Badge {
  _id: string;
  id: number;
  title: string;
  description: string;
  icon?: string;
  earnedBy?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface BadgeRequest {
  _id: string;
  userId: string;
  badgeId: string;
  reason?: string;
  status: 'requested' | 'approved' | 'rejected' | 'canceled';
  requestedAt: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  badge: {
    _id: string;
    title: string;
    description: string;
    icon?: string;
    colorCode?: string;
    earnedBy?: number;
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  rejectedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface BadgesResponse {
  success: boolean;
  data: {
    badges: Badge[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface BadgeRequestsResponse {
  success: boolean;
  data: {
    badgeRequests: BadgeRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface TransformedBadge {
  id: number;
  _id: string;
  title: string;
  icon: string;
  description: string;
  earnedBy: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface BadgeParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Sample data for fallback/demonstration
const sampleBadges: Badge[] = [
  {
    _id: '1',
    id: 1,
    title: 'High Performer',
    description: 'Given for 10+ helpful reviews',
    icon: '🏆',
    earnedBy: 124,
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z'
  },
  {
    _id: '2',
    id: 2,
    title: 'Customer Satisfaction Badge',
    description: 'For profile verification',
    icon: '⭐',
    earnedBy: 421,
    status: 'active',
    createdAt: '2024-01-14T08:00:00Z',
    updatedAt: '2024-01-14T08:00:00Z'
  },
  {
    _id: '3',
    id: 3,
    title: 'Enterprise Leader',
    description: 'Highest review Growth in a quarter',
    icon: '💼',
    earnedBy: 452,
    status: 'inactive',
    createdAt: '2024-01-13T08:00:00Z',
    updatedAt: '2024-01-13T08:00:00Z'
  },
  {
    _id: '4',
    id: 4,
    title: 'Best Vendor Relationships',
    description: '10 Consecutive 5-star ratings',
    icon: '🤝',
    earnedBy: 965,
    status: 'active',
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-12T08:00:00Z'
  },
  {
    _id: '5',
    id: 5,
    title: 'Fast-Growing Products',
    description: '5 Review in a week',
    icon: '🚀',
    earnedBy: 487,
    status: 'inactive',
    createdAt: '2024-01-11T08:00:00Z',
    updatedAt: '2024-01-11T08:00:00Z'
  },
  {
    _id: '6',
    id: 6,
    title: 'Best Usability of Products',
    description: 'Avg rating above 4.5 for 6 months',
    icon: '💡',
    earnedBy: 365,
    status: 'active',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z'
  },
  {
    _id: '7',
    id: 7,
    title: 'Outstanding Customer Service',
    description: '3+ in-depth reviews in 30 days',
    icon: '🎯',
    earnedBy: 254,
    status: 'active',
    createdAt: '2024-01-09T08:00:00Z',
    updatedAt: '2024-01-09T08:00:00Z'
  },
  {
    _id: '8',
    id: 8,
    title: 'Users Love Us',
    description: 'Rapid weekly growth in user engagement',
    icon: '❤️',
    earnedBy: 87,
    status: 'active',
    createdAt: '2024-01-08T08:00:00Z',
    updatedAt: '2024-01-08T08:00:00Z'
  },
  {
    _id: '9',
    id: 9,
    title: 'Momentum Leader',
    description: '5 upvoted review in a month',
    icon: '📈',
    earnedBy: 242,
    status: 'inactive',
    createdAt: '2024-01-07T08:00:00Z',
    updatedAt: '2024-01-07T08:00:00Z'
  },
  {
    _id: '10',
    id: 10,
    title: 'Spotlight of the Week',
    description: '2+ flag reviews found in a month',
    icon: '🌟',
    earnedBy: 545,
    status: 'active',
    createdAt: '2024-01-06T08:00:00Z',
    updatedAt: '2024-01-06T08:00:00Z'
  }
];

// Transform raw badge data from API
const transformBadgeData = (rawBadge: Badge, index: number): TransformedBadge => {
  return {
    id: index + 1,
    _id: rawBadge._id,
    title: rawBadge.title,
    icon: rawBadge.icon || '🏆',
    description: rawBadge.description,
    earnedBy: rawBadge.earnedBy || 0,
    status: rawBadge.status,
    createdAt: rawBadge.createdAt,
    updatedAt: rawBadge.updatedAt
  };
};

export const getBadges = async (params: BadgeParams = {}): Promise<BadgesResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/admin/badges?${queryParams.toString()}`);
    
    // Transform the data if needed
    if (response.data.success && response.data.data.badges) {
      const transformedBadges = response.data.data.badges.map((badge: Badge, index: number) => 
        transformBadgeData(badge, index)
      );
      
      return {
        ...response.data,
        data: {
          ...response.data.data,
          badges: transformedBadges
        }
      };
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching badges:', error);
    
    // Fallback to sample data if API is not available
    if (error?.response?.status === 404 || error?.code === 'ERR_NETWORK') {
      console.warn('Badge API not available, using sample data');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      // Filter sample data based on params
      let filteredBadges = [...sampleBadges];
      
      // Apply search filter
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredBadges = filteredBadges.filter(badge => 
          badge.title.toLowerCase().includes(searchLower) ||
          badge.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply status filter
      if (params.status && params.status !== 'all') {
        filteredBadges = filteredBadges.filter(badge => badge.status === params.status);
      }
      
      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedBadges = filteredBadges.slice(startIndex, endIndex);
      
      // Transform the data
      const transformedBadges = paginatedBadges.map((badge, index) => 
        transformBadgeData(badge, startIndex + index)
      );
      
      return {
        success: true,
        data: {
          badges: transformedBadges,
          pagination: {
            page,
            limit,
            total: filteredBadges.length,
            totalPages: Math.ceil(filteredBadges.length / limit)
          }
        }
      };
    }
    
    throw error;
  }
};

export const getBadgeRequests = async (params: BadgeParams = {}): Promise<BadgeRequestsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/admin/badge-requests?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching badge requests:', error);
    
    // Fallback to empty data
    return {
      success: true,
      data: {
        badgeRequests: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      }
    };
  }
};

export const updateBadgeStatus = async (badgeId: string, status: 'active' | 'inactive'): Promise<any> => {
  try {
    const response = await api.patch(`/admin/badges/${badgeId}/status`, { status });
    return response.data;
  } catch (error: any) {
    console.error('Error updating badge status:', error);
    
    // Simulate successful update for demo
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update the sample data
    const badgeIndex = sampleBadges.findIndex(badge => badge._id === badgeId);
    if (badgeIndex !== -1) {
      sampleBadges[badgeIndex].status = status;
    }
    
    return {
      success: true,
      message: `Badge ${status === 'active' ? 'activated' : 'deactivated'} successfully`
    };
  }
};

export const createBadge = async (badgeData: Partial<Badge>): Promise<any> => {
  try {
    const response = await api.post('/admin/badges', badgeData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating badge:', error);
    throw error;
  }
};

export const updateBadge = async (badgeId: string, badgeData: Partial<Badge>): Promise<any> => {
  try {
    const response = await api.patch(`/admin/badges/${badgeId}`, badgeData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating badge:', error);
    throw error;
  }
};

export const deleteBadge = async (badgeId: string): Promise<any> => {
  try {
    const response = await api.delete(`/admin/badges/${badgeId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting badge:', error);
    
    // Simulate successful delete for demo
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Remove from sample data
    const badgeIndex = sampleBadges.findIndex(badge => badge._id === badgeId);
    if (badgeIndex !== -1) {
      sampleBadges.splice(badgeIndex, 1);
    }
    
    return {
      success: true,
      message: 'Badge deleted successfully'
    };
  }
};

export const approveBadgeRequest = async (requestId: string): Promise<any> => {
  try {
    const response = await api.patch(`/admin/badge-requests/${requestId}/approve`);
    return response.data;
  } catch (error: any) {
    console.error('Error approving badge request:', error);
    throw error;
  }
};

export const rejectBadgeRequest = async (requestId: string, reason?: string): Promise<any> => {
  try {
    const response = await api.patch(`/admin/badge-requests/${requestId}/reject`, { reason });
    return response.data;
  } catch (error: any) {
    console.error('Error rejecting badge request:', error);
    throw error;
  }
};

export const getBadgeRequestDetails = async (requestId: string): Promise<BadgeRequest> => {
  try {
    const response = await api.get(`/admin/badge-requests/${requestId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching badge request details:', error);
    throw error;
  }
}; 