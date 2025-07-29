import { api } from './api';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description: string;
  avgRating: number;
  totalReviews: number;
  softwareIds?: string[];
  solutionIds?: string[];
  industries?: string[];
  marketSegment?: string[];
  userId?: any;
  isActive?: string;
  isFree?: boolean;
}

export interface PaginatedProducts {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const ProductService = {
  getProducts: async (params: { 
    page?: number; 
    limit?: number;
    softwareId?: string;
    solutionId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
  } = {}) => {
    const query = new URLSearchParams();
    query.append('page', (params.page || 1).toString());
    query.append('limit', (params.limit || 100).toString());
    query.append('status', params.status || 'published');
    if (params.softwareId) query.append('softwareIds', params.softwareId);
    if (params.solutionId) query.append('solutionIds', params.solutionId);
    if (params.search) query.append('search', params.search);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    
    const response = await api.get(`/products/active?${query.toString()}`);
    return response.data;
  },

  getProductsBySoftware: async (softwareId: string, params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    const query = new URLSearchParams();
    query.append('page', (params.page || 1).toString());
    query.append('limit', (params.limit || 100).toString());
    query.append('status', 'published');
    // Backend expects 'softwareIds' parameter for filtering
    query.append('softwareIds', softwareId);
    // Sort by avgRating in descending order by default
    query.append('sortBy', params.sortBy || 'avgRating');
    query.append('sortOrder', params.sortOrder || 'desc');
    
    const response = await api.get(`/products/active?${query.toString()}`);
    return response.data;
  },

  getProductsBySoftwareAndSolution: async (params: {
    softwareId?: string;
    solutionId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    const query = new URLSearchParams();
    query.append('page', (params.page || 1).toString());
    query.append('limit', (params.limit || 100).toString());
    query.append('status', 'published');
    // Backend expects plural form for array filtering
    if (params.softwareId) {
      query.append('softwareIds', params.softwareId);
    }
    if (params.solutionId) {
      query.append('solutionIds', params.solutionId);
    }
    // Sort by avgRating in descending order by default
    query.append('sortBy', params.sortBy || 'avgRating');
    query.append('sortOrder', params.sortOrder || 'desc');
    
    const response = await api.get(`/products/active?${query.toString()}`);
    return response.data;
  },

  getProductsBySoftwareOrSolution: async (id: string, params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    const query = new URLSearchParams();
    query.append('page', (params.page || 1).toString());
    query.append('limit', (params.limit || 100).toString());
    query.append('status', 'published');
    // Use categories parameter which checks both softwareIds and solutionIds with OR logic
    query.append('categories', id);
    // Sort by avgRating in descending order by default
    query.append('sortBy', params.sortBy || 'avgRating');
    query.append('sortOrder', params.sortOrder || 'desc');
    
    const response = await api.get(`/products/active?${query.toString()}`);
    return response.data;
  }
};