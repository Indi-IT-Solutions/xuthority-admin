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
  colorCode: string;
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
  colorCode: string;
}

export interface BadgeParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BadgeRequestParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'requested' | 'approved' | 'rejected' | 'canceled' | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

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
    updatedAt: rawBadge.updatedAt,
    colorCode: rawBadge.colorCode
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
    console.error('Error details:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      code: error?.code,
      message: error?.message,
      url: error?.config?.url,
      baseURL: error?.config?.baseURL
    });
    
    throw new Error(`Failed to fetch badges: ${error?.message || 'Unknown error'}`);
  }
};

export const getBadgeRequests = async (params: BadgeRequestParams = {}): Promise<BadgeRequestsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/admin/badge-requests?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching badge requests:', error);
    
    // Return empty data on error
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
    throw error;
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
    throw error;
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

export const getBadgeById = async (badgeId: string): Promise<TransformedBadge> => {
  try {
    const response = await api.get(`/admin/badges/${badgeId}`);
    
    if (response.data.success && response.data.data) {
      const badge = response.data.data;
      return transformBadgeData(badge, 0);
    }
    
    throw new Error('Badge not found');
  } catch (error: any) {
    console.error('Error fetching badge by ID:', error);
    throw error;
  }
}; 