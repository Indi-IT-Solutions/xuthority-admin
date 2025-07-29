import { api } from './api';

export interface Software {
  _id: string;
  name: string;
  slug: string;
  status: string;
  isPopular?: boolean;
  isFeatured?: boolean;
}

export interface SoftwareResponse {
  success: boolean;
  data: Software[];
  pagination?: { 
    page: number; 
    limit: number; 
    total: number; 
    pages: number;
  };
}

export const SoftwareService = {
  getActiveSoftwares: async (params: { 
    search?: string; 
    page?: number; 
    limit?: number 
  } = {}) => {
    const query = new URLSearchParams();
    query.append('page', (params.page || 1).toString());
    query.append('limit', (params.limit || 100).toString());
    if (params.search) query.append('search', params.search);
    
    const response = await api.get(`/software/active?${query.toString()}`);
    return response.data;
  },
};