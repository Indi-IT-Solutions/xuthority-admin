import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LandingPageService, SectionData } from '@/services/landingPageService';
import toast from 'react-hot-toast';

export const useLandingPage = (pageType: string) => {
  return useQuery({
    queryKey: ['landingPage', pageType],
    queryFn: () => LandingPageService.getLandingPage(pageType),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLandingPageSection = (pageType: string, sectionName: string) => {
  return useQuery({
    queryKey: ['landingPage', pageType, 'section', sectionName],
    queryFn: () => LandingPageService.getSection(pageType, sectionName),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateLandingPageSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageType, sectionName, data }: { 
      pageType: string; 
      sectionName: string; 
      data: SectionData;
    }) => LandingPageService.updateSection(pageType, sectionName, data),
    onSuccess: (data, variables) => {
      // Invalidate both the full page and section queries
      queryClient.invalidateQueries({ 
        queryKey: ['landingPage', variables.pageType] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['landingPage', variables.pageType, 'section', variables.sectionName] 
      });
      toast.success('Section updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update section';
      toast.error(message);
    },
  });
};

export const useUpdateLandingPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageType, sections }: { 
      pageType: string; 
      sections: { [key: string]: any };
    }) => LandingPageService.updateLandingPage(pageType, sections),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['landingPage', variables.pageType] 
      });
      toast.success('Landing page updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update landing page';
      toast.error(message);
    },
  });
};

export const useResetLandingPageSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageType, sectionName }: { 
      pageType: string; 
      sectionName: string;
    }) => LandingPageService.resetSection(pageType, sectionName),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['landingPage', variables.pageType] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['landingPage', variables.pageType, 'section', variables.sectionName] 
      });
      toast.success('Section reset successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to reset section';
      toast.error(message);
    },
  });
};

export const useAllLandingPages = () => {
  return useQuery({
    queryKey: ['landingPages', 'summary'],
    queryFn: () => LandingPageService.getAllLandingPages(),
    staleTime: 5 * 60 * 1000,
  });
};