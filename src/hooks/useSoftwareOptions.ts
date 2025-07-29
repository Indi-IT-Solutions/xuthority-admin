import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { SoftwareService } from '@/services/softwareService';
import { useMemo } from 'react';

export const useSoftwareOptions = (page: number = 1, limit: number = 10, searchTerm: string = '') => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['softwares', searchTerm, page, limit],
    queryFn: () => SoftwareService.getActiveSoftwares({ search: searchTerm, page, limit }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const options = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((item) => ({
      value: item._id,
      label: item.name,
      slug: item.slug,
    }));
  }, [data]);

  return { options, isLoading, error };
};