import { ApiService, ApiResponse } from './api';

// Types for Blog/Resource
export interface Blog {
  _id: string;
  title: string;
  slug: string;
  description: string;
  authorName: string;
  designation?: string;
  mediaUrl?: string;
  watchUrl?: string;
  tag: string;
  status: 'active' | 'inactive';
  resourceCategoryId: {
    _id: string;
    name: string;
    slug: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ResourceCategory {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogRequest {
  title: string;
  description: string;
  authorName: string;
  designation?: string;
  mediaUrl?: string;
  watchUrl?: string;
  tag: string;
  resourceCategoryId: string;
  status?: 'active' | 'inactive';
}

export interface BlogsResponse {
  success: boolean;
  data: {
    blogs: Blog[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message?: string;
}

export interface ResourceCategoriesResponse {
  success: boolean;
  data: ResourceCategory[];
  message?: string;
}

// Blog Service Class
export class BlogService {
  /**
   * Create a new blog/resource (Admin only)
   */
  static async createBlog(data: CreateBlogRequest): Promise<ApiResponse<Blog>> {
    try {
      const response = await ApiService.post<Blog>('/admin/blogs', data);
      return response;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  }

  /**
   * Get all blogs with pagination and filtering (uses public endpoint)
   */
  static async getBlogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    resourceCategoryId?: string;
  } = {}): Promise<BlogsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.resourceCategoryId) queryParams.append('resourceCategoryId', params.resourceCategoryId);

      const url = `/blogs?${queryParams.toString()}`;
      const response = await ApiService.get<any>(url);

      return response;
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  }

  /**
   * Get all blogs for admin panel (uses admin endpoint)
   */
  static async getAdminBlogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    resourceCategoryId?: string;
    tag?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<BlogsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.resourceCategoryId) queryParams.append('resourceCategoryId', params.resourceCategoryId);
      if (params.tag) queryParams.append('tag', params.tag);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `/admin/blogs?${queryParams.toString()}`;
      const response = await ApiService.get<any>(url);

      return response;
    } catch (error) {
      console.error('Error fetching admin blogs:', error);
      throw error;
    }
  }

  /**
   * Get blog by ID (Admin only)
   */
  static async getBlogById(id: string): Promise<{ success: boolean; data: Blog; message?: string }> {
    try {
      const response = await ApiService.get<Blog>(`/blogs/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching blog:', error);
      throw error;
    }
  }

  /**
   * Update blog (Admin only)
   */
  static async updateBlog(id: string, data: Partial<CreateBlogRequest>): Promise<{ success: boolean; data: Blog; message?: string }> {
    try {
      const response = await ApiService.put<Blog>(`/admin/blogs/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  }

  /**
   * Delete blog (Admin only)
   */
  static async deleteBlog(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await ApiService.delete(`/admin/blogs/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  }

  /**
   * Get resource categories (Admin only)
   */
  static async getResourceCategories(): Promise<ResourceCategoriesResponse> {
    try {
      const response = await ApiService.get<ResourceCategory[]>('/admin/resource-categories');
      return response;
    } catch (error) {
      console.error('Error fetching resource categories:', error);
      throw error;
    }
  }
} 