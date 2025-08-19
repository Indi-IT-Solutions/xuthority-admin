import React, { useState } from 'react';
import { Breadcrumb } from '@/components/landing-pages-shared/Breadcrumb';
import { TabNavigation } from '@/components/landing-pages-shared/TabNavigation';
import { Sidebar } from '@/components/landing-pages-shared/Sidebar';
import { getSections } from '@/components/landing-pages-shared/config';
import { Skeleton } from '@/components/ui/skeleton';

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

// Skeleton loading components for different section types
const SectionSkeleton = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    
    {/* Content skeleton */}
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    
    {/* Action buttons skeleton */}
    <div className="flex space-x-4 pt-4">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

const HeroSectionSkeleton = () => (
  <div className="space-y-8">
    {/* Hero content skeleton */}
    <div className="text-center space-y-6">
      <Skeleton className="h-12 w-3/4 mx-auto" />
      <Skeleton className="h-6 w-1/2 mx-auto" />
      <Skeleton className="h-6 w-2/3 mx-auto" />
      <div className="flex justify-center space-x-4 pt-4">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
    
    {/* Hero image skeleton */}
    <div className="flex justify-center">
      <Skeleton className="h-64 w-full max-w-2xl rounded-lg" />
    </div>
  </div>
);

const CategoriesSectionSkeleton = () => (
  <div className="space-y-6">
    <div className="text-center space-y-4">
      <Skeleton className="h-8 w-1/3 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
    </div>
    
    {/* Categories grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

const FeaturesSectionSkeleton = () => (
  <div className="space-y-8">
    <div className="text-center space-y-4">
      <Skeleton className="h-8 w-1/2 mx-auto" />
      <Skeleton className="h-4 w-2/3 mx-auto" />
    </div>
    
    {/* Features grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-4 text-center">
          <Skeleton className="h-16 w-16 mx-auto rounded-full" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  </div>
);

const TestimonialsSectionSkeleton = () => (
  <div className="space-y-6">
    <div className="text-center space-y-4">
      <Skeleton className="h-8 w-1/3 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
    </div>
    
    {/* Testimonials grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-4 p-6 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  </div>
);

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

// Map section names to skeleton components
const skeletonComponents: Record<string, Record<string, React.FC>> = {
  user: {
    hero: HeroSectionSkeleton,
    categories: CategoriesSectionSkeleton,
    features: FeaturesSectionSkeleton,
    'review-cta': SectionSkeleton,
    popular: CategoriesSectionSkeleton,
    insights: SectionSkeleton,
    'vendor-cta': SectionSkeleton,
    testimonials: TestimonialsSectionSkeleton,
  },
  vendor: {
    hero: HeroSectionSkeleton,
    'reachBuyers': SectionSkeleton,
    'trusted-tech': FeaturesSectionSkeleton,
  },
  about: {
    hero: HeroSectionSkeleton,
    'missionSupport': SectionSkeleton,
    'values': FeaturesSectionSkeleton,
  },
};

export const LandingPagesContainerV2: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'user' | 'vendor' | 'about'>('user');
  const [selectedSection, setSelectedSection] = useState('hero');
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (tab: 'user' | 'vendor' | 'about') => {
    setIsLoading(true);
    setActiveTab(tab);
    setSelectedSection('hero');
    
    // Simulate loading time for better UX
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleSectionChange = (sectionId: string) => {
    setIsLoading(true);
    setSelectedSection(sectionId);
    
    // Simulate loading time for better UX
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  const sections = getSections(activeTab);
  const SectionComponent = sectionComponents[activeTab]?.[selectedSection];
  const SkeletonComponent = skeletonComponents[activeTab]?.[selectedSection];

  return (
    <div className="w-full mx-auto">
      <Breadcrumb />
      <div className="bg-white rounded-lg p-2 sm:p-4">
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="flex flex-col md:grid md:grid-cols-12 md:gap-8">
          {/* Sidebar: full width on mobile, sidebar on tablet/desktop */}
          <div className="mb-4 md:mb-0 md:col-span-4 lg:col-span-3">
            {isLoading ? (
              <div className="space-y-4">
                {/* Sidebar skeleton */}
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Sidebar
                sections={sections}
                selectedSection={selectedSection}
                onSectionChange={handleSectionChange}
              />
            )}
          </div>
          
          {/* Main content: full width on mobile, main area on tablet/desktop */}
          <div className="md:col-span-8 lg:col-span-9">
            {isLoading ? (
              <div className="space-y-6">
                {/* Loading indicator */}
                {/* <div className="flex items-center justify-center py-4">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Loading section...</span>
                  </div>
                </div> */}
                
                {/* Skeleton loading */}
                {SkeletonComponent ? (
                  <SkeletonComponent />
                ) : (
                  <SectionSkeleton />
                )}
              </div>
            ) : SectionComponent ? (
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