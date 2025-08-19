import { ApiService, ApiResponse } from './api';

export type ContactStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type ContactReason = 'sales' | 'support' | 'partnership' | 'press' | 'other';

export interface ContactQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContactStatus;
  reason?: ContactReason;
  ticketId?: string;
  period?: 'weekly' | 'monthly' | 'yearly';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt';
  sortOrder?: 'asc' | 'desc';
  appliedAt?: number;
}

export interface RawContactTicket {
  _id: string;
  ticketId: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  subject: string;
  reason: ContactReason;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TransformedContactTicket {
  id: number;
  _id: string;
  ticketId: string;
  requester: {
    name: string;
    email: string;
    company?: string;
  };
  subject: string;
  reason: string;
  status: ContactStatus;
  createdOn: string;
}

export interface ContactsApiResponse {
  contacts: TransformedContactTicket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const transformContact = (raw: RawContactTicket, index: number): TransformedContactTicket => {
  const createdOn = new Date(raw.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: '2-digit'
  });
  return {
    id: index + 1,
    _id: raw._id,
    ticketId: raw.ticketId,
    requester: {
      name: `${raw.firstName} ${raw.lastName}`.trim(),
      email: raw.email,
      company: raw.company,
    },
    subject: raw.subject,
    reason: raw.reason,
    status: raw.status,
    createdOn,
  };
};

export class ContactService {
  static async getContacts(params: ContactQueryParams = {}): Promise<ApiResponse<ContactsApiResponse>> {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', String(params.page));
    if (params.limit) qs.append('limit', String(params.limit));
    if (params.search) qs.append('search', params.search);
    if (params.status) qs.append('status', params.status);
    if (params.reason) qs.append('reason', params.reason);
    if (params.ticketId) qs.append('ticketId', params.ticketId);
    if (params.period) qs.append('period', params.period);
    if (params.dateFrom) qs.append('dateFrom', params.dateFrom);
    if (params.dateTo) qs.append('dateTo', params.dateTo);
    if (params.sortBy) qs.append('sortBy', params.sortBy);
    if (params.sortOrder) qs.append('sortOrder', params.sortOrder);

    const url = `/contact-tickets?${qs.toString()}`;
    const response = await ApiService.get<{ items: RawContactTicket[]; pagination: any }>(url);

    if (response.success && response.data) {
      const pagination = response.meta?.pagination || response.data.pagination;
      const transformed = (response.data.items || []).map((c, idx) => 
        transformContact(c, (pagination.page - 1) * pagination.limit + idx)
      );
      return {
        success: true,
        data: {
          contacts: transformed,
          pagination: {
            page: pagination.page || pagination.currentPage || 1,
            limit: pagination.limit || pagination.itemsPerPage || 10,
            total: pagination.total || pagination.totalItems || transformed.length,
            totalPages: pagination.totalPages || Math.ceil((pagination.total || transformed.length) / (pagination.limit || 10))
          }
        },
        message: response.message,
        meta: response.meta
      } as any;
    }

    throw new Error(response.message || 'Failed to fetch contact tickets');
  }
}
