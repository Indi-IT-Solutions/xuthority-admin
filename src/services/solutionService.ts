import { api } from './api';

export interface Solution {
  _id: string;
  name: string;
  slug: string;
  status: string;
}

export interface SolutionResponse {
  success: boolean;
  data: Solution[];
  pagination?: { 
    page: number; 
    limit: number; 
    total: number; 
    pages: number;
  };
}

export const SolutionService = {
  getActiveSolutions: async (params: { 
    search?: string; 
    page?: number; 
    limit?: number 
  } = {}) => {
    const query = new URLSearchParams();
    query.append('page', (params.page || 1).toString());
    query.append('limit', (params.limit || 100).toString());
    if (params.search) query.append('search', params.search);
    
    const response = await api.get(`/solutions/active?${query.toString()}`);
    return response.data;
  },
};