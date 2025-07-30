import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LandingPageService } from '@/services/landingPageService';
import toast from 'react-hot-toast';

export type PageType = 'user' | 'vendor' | 'about';
export type SectionName = string;

interface SectionData {
  [key: string]: any;
}

interface UpdateSectionParams {
  pageType: PageType;
  sectionName: SectionName;
  data: SectionData;
}

// Hook to fetch a specific section data
export const useLandingPageSection = (pageType: PageType, sectionName: SectionName) => {
  return useQuery({
    queryKey: ['landingPage', pageType, sectionName],
    queryFn: async () => {
      // Call the section-specific API endpoint
      const response = await LandingPageService.getSection(pageType, sectionName);
      return response.data || {};
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to update/create a specific section
export const useUpdateLandingPageSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pageType, sectionName, data }: UpdateSectionParams) => {
      return await LandingPageService.updateSection(pageType, sectionName, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['landingPage', variables.pageType, variables.sectionName] 
      });
      toast.success('Section updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update section');
    },
  });
};

