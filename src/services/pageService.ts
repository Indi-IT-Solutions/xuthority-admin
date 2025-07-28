import { ApiService, ApiResponse } from './api';

// Types for Page
export interface Page {
  _id: string;
  name: string;
  slug: string;
  content?: string;
  isSystemPage: boolean;
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

export interface CreatePageRequest {
  name: string;
  slug?: string;
  isSystemPage?: boolean;
  status?: 'active' | 'inactive';
}

export interface UpdatePageRequest {
  name?: string;
  slug?: string;
  content?: string;
  isSystemPage?: boolean;
  status?: 'active' | 'inactive';
}

export interface PageFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  isSystemPage?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPages {
  pages: Page[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Page service class
export class PageService {
  // Get all pages (admin)
  static async getAllPages(filters: PageFilters = {}): Promise<ApiResponse<PaginatedPages>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.isSystemPage) params.append('isSystemPage', filters.isSystemPage);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const url = `/admin/pages${params.toString() ? `?${params.toString()}` : ''}`;
    return ApiService.get<PaginatedPages>(url);
  }

  // Get active pages (public)
  static async getActivePages(filters: PageFilters = {}): Promise<ApiResponse<PaginatedPages>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.isSystemPage) params.append('isSystemPage', filters.isSystemPage);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const url = `/pages/active${params.toString() ? `?${params.toString()}` : ''}`;
    return ApiService.get<PaginatedPages>(url);
  }

  // Get page by ID (admin)
  static async getPageById(pageId: string): Promise<ApiResponse<Page>> {
    return ApiService.get<Page>(`/admin/pages/${pageId}`);
  }

  // Get page by slug (public)
  static async getPageBySlug(slug: string): Promise<ApiResponse<Page>> {
    return ApiService.get<Page>(`/pages/${slug}`);
  }

  // Create page (admin)
  static async createPage(data: CreatePageRequest): Promise<ApiResponse<Page>> {
    return ApiService.post<Page>('/admin/pages', data);
  }

  // Update page (admin)
  static async updatePage(pageId: string, data: UpdatePageRequest): Promise<ApiResponse<Page>> {
    return ApiService.put<Page>(`/admin/pages/${pageId}`, data);
  }

  // Delete page (admin)
  static async deletePage(pageId: string): Promise<ApiResponse<null>> {
    return ApiService.delete<null>(`/admin/pages/${pageId}`);
  }

  // Toggle page status (admin)
  static async togglePageStatus(pageId: string): Promise<ApiResponse<Page>> {
    return ApiService.patch<Page>(`/admin/pages/${pageId}/toggle-status`);
  }

  // Bulk delete pages (admin)
  static async bulkDeletePages(pageIds: string[]): Promise<ApiResponse<{ deletedCount: number; requestedCount: number }>> {
    return ApiService.delete<{ deletedCount: number; requestedCount: number }>('/admin/pages/bulk', {
      data: { pageIds }
    });
  }
}

export default PageService; 