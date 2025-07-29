import api from './api';

export interface LandingPageData {
  _id?: string;
  pageType: 'user' | 'vendor' | 'about';
  sections: {
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface SectionData {
  [key: string]: any;
}

export const LandingPageService = {
  // Get landing page by type
  getLandingPage: async (pageType: string) => {
    const response = await api.get(`/landing-pages/${pageType}`);
    return response.data;
  },

  // Get specific section
  getSection: async (pageType: string, sectionName: string) => {
    const response = await api.get(`/landing-pages/${pageType}/sections/${sectionName}`);
    return response.data;
  },

  // Update specific section
  updateSection: async (pageType: string, sectionName: string, data: SectionData) => {
    const response = await api.put(`/landing-pages/${pageType}/sections/${sectionName}`, data);
    return response.data;
  },

  // Update entire landing page
  updateLandingPage: async (pageType: string, sections: { [key: string]: any }) => {
    const response = await api.put(`/landing-pages/${pageType}`, { sections });
    return response.data;
  },

  // Reset section to default
  resetSection: async (pageType: string, sectionName: string) => {
    const response = await api.delete(`/landing-pages/${pageType}/sections/${sectionName}`);
    return response.data;
  },

  // Get all landing pages summary
  getAllLandingPages: async () => {
    const response = await api.get('/landing-pages');
    return response.data;
  },
};