import { ApiService, ApiResponse } from './api';

export type ProductStatus = 'pending' | 'approved' | 'rejected' | 'draft' | 'published' | 'archived';

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'views' | 'likes' | 'avgRating' | 'totalReviews';
  sortOrder?: 'asc' | 'desc';
  // date filters
  period?: 'weekly' | 'monthly' | 'yearly';
  dateFrom?: string;
  dateTo?: string;
  appliedAt?: number;
}

export interface RawProductItem {
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description: string;
  avgRating?: number;
  totalReviews?: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TransformedProductItem {
  id: number;
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description: string;
  avgRating: number;
  totalReviews: number;
  status: ProductStatus;
  createdOn: string;
}

export interface ProductsApiResponse {
  products: TransformedProductItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const transform = (p: RawProductItem, index: number, page: number, limit: number): TransformedProductItem => {
  return {
    ...p,
    id: (page - 1) * limit + index + 1,
    _id: p._id,
    name: p.name,
    slug: p.slug,
    logoUrl: p.logoUrl,
    description: p.description,
    avgRating: typeof p.avgRating === 'number' ? p.avgRating : 0,
    totalReviews: typeof p.totalReviews === 'number' ? p.totalReviews : 0,
    status: p.status,

    createdOn: new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
  };
};

export class AdminProductService {
  static async list(params: ProductListQuery = {}): Promise<ApiResponse<ProductsApiResponse>> {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', String(params.page));
    if (params.limit) qs.append('limit', String(params.limit));
    if (params.search) qs.append('search', params.search);
    if (params.status) qs.append('status', params.status);
    if (params.sortBy) qs.append('sortBy', params.sortBy);
    if (params.sortOrder) qs.append('sortOrder', params.sortOrder);
    if (params.period) qs.append('period', params.period);
    if (params.dateFrom) qs.append('dateFrom', params.dateFrom);
    if (params.dateTo) qs.append('dateTo', params.dateTo);

    // Use admin endpoint to ensure visibility and admin-only access
    const url = `/admin/products?${qs.toString()}`;
    const response = await ApiService.get<RawProductItem[]>(url);

    if (response.success && response.data) {
      const meta = response.meta?.pagination || { page: Number(params.page) || 1, limit: Number(params.limit) || 10, total: (response.data as any).length || 0, totalPages: 1 } as any;
      const products = (response.data as any[]).map((p, idx) => transform(p as any, idx, meta.page || meta.currentPage || 1, meta.limit || meta.itemsPerPage || (params.limit || 10)));
      return {
        success: true,
        data: {
          products,
          pagination: {
            page: meta.page || meta.currentPage || 1,
            limit: meta.limit || meta.itemsPerPage || (params.limit || 10),
            total: meta.total || meta.totalItems || products.length,
            totalPages: meta.totalPages || Math.ceil((meta.total || products.length) / (meta.limit || 10))
          }
        },
        message: response.message,
        meta: response.meta
      } as any;
    }

    throw new Error(response.message || 'Failed to fetch products');
  }

  static async approve(productId: string): Promise<ApiResponse<any>> {
    return ApiService.patch(`/admin/products/${productId}/approve`);
  }

  static async reject(productId: string, reason?: string): Promise<ApiResponse<any>> {
    return ApiService.patch(`/admin/products/${productId}/reject`, { reason });
  }

  static async getBySlug(slug: string): Promise<ApiResponse<any>> {
    return ApiService.get(`/admin/products/${slug}`);
  }
}


