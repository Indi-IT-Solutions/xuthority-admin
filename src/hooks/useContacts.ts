import { useQuery } from '@tanstack/react-query';
import { ContactService, ContactQueryParams } from '@/services/contactService';

export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (params: ContactQueryParams) => [...contactKeys.lists(), params] as const,
};

export const useContacts = (params: ContactQueryParams = {}) => {
  return useQuery({
    queryKey: contactKeys.list(params),
    queryFn: async () => {
      const response = await ContactService.getContacts(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch contacts');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
};
