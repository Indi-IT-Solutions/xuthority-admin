import { ApiService, ApiResponse } from './api';

// Types for MetaTag
export interface MetaTag {
  _id: string;
  pageName: string;
  metaTitle: string;
  metaDescription: string;
  status: 'active' | 'inactive';
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMetaTagRequest {
  pageName: string;
  metaTitle: string;
  metaDescription: string;
  status?: 'active' | 'inactive';
}

export interface UpdateMetaTagRequest {
  pageName?: string;
  metaTitle?: string;
  metaDescription?: string;
  status?: 'active' | 'inactive';
}

export interface MetaTagFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedMetaTags {
  metaTags: MetaTag[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// MetaTag service class
export class MetaTagService {
  // Get all meta tags (admin)
  static async getAllMetaTags(filters: MetaTagFilters = {}): Promise<ApiResponse<PaginatedMetaTags>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const url = `/admin/meta-tags${params.toString() ? `?${params.toString()}` : ''}`;
    return ApiService.get<PaginatedMetaTags>(url);
  }

  // Get active meta tags (public)
  static async getActiveMetaTags(filters: MetaTagFilters = {}): Promise<ApiResponse<PaginatedMetaTags>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const url = `/meta-tags/active${params.toString() ? `?${params.toString()}` : ''}`;
    return ApiService.get<PaginatedMetaTags>(url);
  }

  // Get meta tag by ID (admin)
  static async getMetaTagById(metaTagId: string): Promise<ApiResponse<MetaTag>> {
    return ApiService.get<MetaTag>(`/admin/meta-tags/${metaTagId}`);
  }

  // Get meta tag by page name (public)
  static async getMetaTagByPageName(pageName: string): Promise<ApiResponse<MetaTag>> {
    return ApiService.get<MetaTag>(`/meta-tags/page/${pageName}`);
  }

  // Create meta tag (admin)
  static async createMetaTag(data: CreateMetaTagRequest): Promise<ApiResponse<MetaTag>> {
    return ApiService.post<MetaTag>('/admin/meta-tags', data);
  }

  // Update meta tag (admin)
  static async updateMetaTag(metaTagId: string, data: UpdateMetaTagRequest): Promise<ApiResponse<MetaTag>> {
    return ApiService.put<MetaTag>(`/admin/meta-tags/${metaTagId}`, data);
  }

  // Delete meta tag (admin)
  static async deleteMetaTag(metaTagId: string): Promise<ApiResponse<null>> {
    return ApiService.delete<null>(`/admin/meta-tags/${metaTagId}`);
  }

  // Toggle meta tag status (admin)
  static async toggleMetaTagStatus(metaTagId: string): Promise<ApiResponse<MetaTag>> {
    return ApiService.patch<MetaTag>(`/admin/meta-tags/${metaTagId}/toggle-status`);
  }

  // Bulk delete meta tags (admin)
  static async bulkDeleteMetaTags(metaTagIds: string[]): Promise<ApiResponse<{ deletedCount: number; requestedCount: number }>> {
    return ApiService.delete<{ deletedCount: number; requestedCount: number }>('/admin/meta-tags/bulk', {
      data: { metaTagIds }
    });
  }
}

export default MetaTagService; 