import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false, // Disable all retries to prevent duplicate toast notifications
    },
    mutations: {
      retry: false, // Disable mutation retries as well
    },
  },
}); 