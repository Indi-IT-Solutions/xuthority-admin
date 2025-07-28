import { ApiService, ApiResponse } from './api';

// Generic collection item interface
export interface CollectionItem {
  _id: string;
  name: string;
  slug?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // Allow additional properties
}

// Collection filters interface
export interface CollectionFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Paginated collection response
export interface PaginatedCollection {
  [key: string]: CollectionItem[]; // Dynamic key based on collection type
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Collection configuration
export interface CollectionConfig {
  name: string;
  endpoint: string;
  pluralName: string;
  fields: {
    label: string;
    key: string;
    type: 'text' | 'status' | 'date';
  }[];
}

// Collection configurations
export const COLLECTION_CONFIGS: Record<string, CollectionConfig> = {
  'softwares': {
    name: 'Software',
    endpoint: 'software',
    pluralName: 'software',
    fields: [
      { label: 'Name', key: 'name', type: 'text' },
      // { label: 'Status', key: 'status', type: 'status' },
      { label: 'Created At', key: 'createdAt', type: 'date' },
    ]
  },
  'solutions': {
    name: 'Solution',
    endpoint: 'solutions',
    pluralName: 'solutions',
    fields: [
      { label: 'Name', key: 'name', type: 'text' },
      // { label: 'Status', key: 'status', type: 'status' },
      { label: 'Created At', key: 'createdAt', type: 'date' },
    ]
  },
  'industries': {
    name: 'Industry',
    endpoint: 'industries',
    pluralName: 'industries',
    fields: [
      { label: 'Name', key: 'name', type: 'text' },
      { label: 'Category', key: 'category', type: 'text' },
      // { label: 'Status', key: 'status', type: 'status' },
      { label: 'Created At', key: 'createdAt', type: 'date' },
    ]
  },
  'languages': {
    name: 'Language',
    endpoint: 'languages',
    pluralName: 'languages',
    fields: [
      { label: 'Name', key: 'name', type: 'text' },
      // { label: 'Status', key: 'status', type: 'status' },
      { label: 'Created At', key: 'createdAt', type: 'date' },
    ]
  },
  'market-segment': {
    name: 'Market Segment',
    endpoint: 'market-segments',
    pluralName: 'marketSegments',
    fields: [
      { label: 'Name', key: 'name', type: 'text' },
      // { label: 'Status', key: 'status', type: 'status' },
      { label: 'Created At', key: 'createdAt', type: 'date' },
    ]
  },
  'integrations': {
    name: 'Integration',
    endpoint: 'integrations',
    pluralName: 'integrations',
    fields: [
      { label: 'Name', key: 'name', type: 'text' },
      // { label: 'Type', key: 'type', type: 'text' },
      // { label: 'Status', key: 'status', type: 'status' },
      { label: 'Created At', key: 'createdAt', type: 'date' },
    ]
  },
  'who-can-use': {
    name: 'User Role',
    endpoint: 'user-roles',
    pluralName: 'userRoles',
    fields: [
      { label: 'Name', key: 'name', type: 'text' },
      // { label: 'Status', key: 'status', type: 'status' },
      { label: 'Created At', key: 'createdAt', type: 'date' },
    ]
  }
};

// Generic Collection Service
export class CollectionService {
  // Get all items from a collection
  static async getCollectionItems(
    collectionSlug: string, 
    filters: CollectionFilters = {}
  ): Promise<ApiResponse<PaginatedCollection>> {
    const config = COLLECTION_CONFIGS[collectionSlug];
    if (!config) {
      throw new Error(`Unknown collection: ${collectionSlug}`);
    }

    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const url = `/${config.endpoint}${params.toString() ? `?${params.toString()}` : ''}`;
    return ApiService.get<PaginatedCollection>(url);
  }

  // Get collection item by ID
  static async getCollectionItemById(
    collectionSlug: string, 
    itemId: string
  ): Promise<ApiResponse<CollectionItem>> {
    const config = COLLECTION_CONFIGS[collectionSlug];
    if (!config) {
      throw new Error(`Unknown collection: ${collectionSlug}`);
    }

    return ApiService.get<CollectionItem>(`/${config.endpoint}/${itemId}`);
  }

  // Create collection item (admin)
  static async createCollectionItem(
    collectionSlug: string, 
    data: Partial<CollectionItem>
  ): Promise<ApiResponse<CollectionItem>> {
    const config = COLLECTION_CONFIGS[collectionSlug];
    if (!config) {
      throw new Error(`Unknown collection: ${collectionSlug}`);
    }

    return ApiService.post<CollectionItem>(`/admin/${config.endpoint}`, data);
  }

  // Update collection item (admin)
  static async updateCollectionItem(
    collectionSlug: string, 
    itemId: string, 
    data: Partial<CollectionItem>
  ): Promise<ApiResponse<CollectionItem>> {
    const config = COLLECTION_CONFIGS[collectionSlug];
    if (!config) {
      throw new Error(`Unknown collection: ${collectionSlug}`);
    }

    return ApiService.put<CollectionItem>(`/admin/${config.endpoint}/${itemId}`, data);
  }

  // Delete collection item (admin)
  static async deleteCollectionItem(
    collectionSlug: string, 
    itemId: string
  ): Promise<ApiResponse<null>> {
    const config = COLLECTION_CONFIGS[collectionSlug];
    if (!config) {
      throw new Error(`Unknown collection: ${collectionSlug}`);
    }

    return ApiService.delete<null>(`/admin/${config.endpoint}/${itemId}`);
  }

  // Bulk delete collection items (admin)
  static async bulkDeleteCollectionItems(
    collectionSlug: string, 
    itemIds: string[]
  ): Promise<ApiResponse<{ deletedCount: number; requestedCount: number }>> {
    const config = COLLECTION_CONFIGS[collectionSlug];
    if (!config) {
      throw new Error(`Unknown collection: ${collectionSlug}`);
    }

    return ApiService.delete<{ deletedCount: number; requestedCount: number }>(`/admin/${config.endpoint}/bulk`, {
      data: { ids: itemIds }
    });
  }

  // Get collection configuration
  static getCollectionConfig(collectionSlug: string): CollectionConfig {
    const config = COLLECTION_CONFIGS[collectionSlug];
    if (!config) {
      throw new Error(`Unknown collection: ${collectionSlug}`);
    }
    return config;
  }
}

export default CollectionService; 