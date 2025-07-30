import React, { useState } from 'react';
import { Breadcrumb } from '@/components/landing-pages-shared/Breadcrumb';
import { TabNavigation } from '@/components/landing-pages-shared/TabNavigation';
import { Sidebar } from '@/components/landing-pages-shared/Sidebar';
import { getSections } from '@/components/landing-pages-shared/config';

// User page sections
import { 
  HeroSection,
  CategoriesSection,
  FeaturesSection,
  ReviewCtaSection,
  PopularSection,
  BuyerInsightSection,
  VendorCtaSection,
  TestimonialsSection
} from './sections/user';

// Vendor page sections
import {
  HeroSection as VendorHeroSection,
  ReachMoreBuyersSection,
  TrustedTechSection
} from './sections/vendor';

// About page sections
import {
  HeroSection as AboutHeroSection,
  MissionSupportSection,
  ValuesSection
} from './sections/about';

// Map section names to components
const sectionComponents: Record<string, Record<string, React.FC<{ pageType: any }>>> = {
  user: {
    hero: HeroSection,
    categories: CategoriesSection,
    features: FeaturesSection,
    'review-cta': ReviewCtaSection,
    popular: PopularSection,
    insights: BuyerInsightSection,
    'vendor-cta': VendorCtaSection,
    testimonials: TestimonialsSection,
    // Add more user sections here
  },
  vendor: {
    hero: VendorHeroSection,
    'reachBuyers': ReachMoreBuyersSection,
    'trusted-tech': TrustedTechSection,
    // Add more vendor sections here
  },
  about: {
    hero: AboutHeroSection,
    'missionSupport': MissionSupportSection,
    'values': ValuesSection,
    // Add more about sections here
  },
};

export const LandingPagesContainerV2: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'user' | 'vendor' | 'about'>('user');
  const [selectedSection, setSelectedSection] = useState('hero');

  const handleTabChange = (tab: 'user' | 'vendor' | 'about') => {
    setActiveTab(tab);
    setSelectedSection('hero');
  };

  const handleSectionChange = (sectionId: string) => {
    setSelectedSection(sectionId);
  };

  const sections = getSections(activeTab);
  const SectionComponent = sectionComponents[activeTab]?.[selectedSection];

  return (
    <div className="w-full mx-auto">
      <Breadcrumb />
      <div className="bg-white rounded-lg p-2 sm:p-4">
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="flex flex-col md:grid md:grid-cols-12 md:gap-8">
          {/* Sidebar: full width on mobile, sidebar on tablet/desktop */}
          <div className="mb-4 md:mb-0 md:col-span-4 lg:col-span-3">
            <Sidebar
              sections={sections}
              selectedSection={selectedSection}
              onSectionChange={handleSectionChange}
            />
          </div>
          
          {/* Main content: full width on mobile, main area on tablet/desktop */}
          <div className="md:col-span-8 lg:col-span-9">
            {SectionComponent ? (
              <SectionComponent pageType={activeTab} />
            ) : (
              <div className="bg-gray-100 rounded-lg p-4 sm:p-8 text-center">
                <p className="text-gray-600">Section not implemented yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};