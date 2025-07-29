import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";

import { Breadcrumb } from "./sections/Breadcrumb";
import { TabNavigation } from "./sections/TabNavigation";
import { Sidebar } from "./sections/Sidebar";
import { FormContainer } from "./sections/FormContainer";
import { getSections, getSectionInfo } from "./sections/config";
import { schemas } from "./schemas";
import { PageType } from "./types";
import { useLandingPage, useUpdateLandingPageSection } from "@/hooks/useLandingPages";

export const LandingPagesContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PageType>("user");
  const [selectedSection, setSelectedSection] = useState("hero");
  
  // Fetch landing page data
  const { data: landingPageData, isLoading } = useLandingPage(activeTab);
  const updateSection = useUpdateLandingPageSection();
  
  const currentSchema = schemas[selectedSection as keyof typeof schemas];
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<any>({
    defaultValues: {},
    resolver: currentSchema ? zodResolver(currentSchema) : undefined,
  });

  // Load section data when landing page data or section changes
  useEffect(() => {
    if (landingPageData?.data?.sections) {
      // Map hyphenated section names to camelCase for backend compatibility
      const sectionNameMap: Record<string, string> = {
        'review-cta': 'reviewCta',
        'vendor-cta': 'vendorCta',
        'trusted-tech': 'trustedTech',
        'reach-buyers': 'reachBuyers',
        'mission-support': 'mission'
      };
      
      const backendSectionName = sectionNameMap[selectedSection] || selectedSection;
      const sectionData = landingPageData.data.sections[backendSectionName];
      
      console.log('LandingPagesContainer - Section:', selectedSection, 'Backend name:', backendSectionName);
      console.log('LandingPagesContainer - Section data:', sectionData);
      
      if (sectionData && Object.keys(sectionData).length > 0) {
        // For complex sections, we need to ensure the data is properly formatted
        if (backendSectionName === 'categories' && sectionData.categories) {
          // Ensure categories have proper IDs
          const formattedData = {
            ...sectionData,
            categories: sectionData.categories.map((cat: any, index: number) => ({
              id: cat._id || cat.id || String(index + 1),
              name: cat.name,
              products: cat.products || []
            }))
          };
          console.log('LandingPagesContainer - Formatted categories data:', formattedData);
          reset(formattedData);
        } else if (backendSectionName === 'popular' && sectionData.solutions) {
          // Ensure solutions have proper IDs
          const formattedData = {
            ...sectionData,
            solutions: sectionData.solutions.map((sol: any, index: number) => ({
              id: sol._id || sol.id || String(index + 1),
              name: sol.name,
              types: sol.types || []
            }))
          };
          reset(formattedData);
        } else {
          reset(sectionData);
        }
      } else {
        reset({});
      }
    } else {
      reset({});
    }
  }, [landingPageData, selectedSection, reset]);

  const handleTabChange = (tab: PageType) => {
    setActiveTab(tab);
    setSelectedSection("hero"); // Reset to hero section when switching tabs
    reset(); // Reset form
  };
  
  const handleSectionChange = (sectionId: string) => {
    setSelectedSection(sectionId);
    // Form will be reset by useEffect when section changes
  };

  const onSubmit = async (data: any) => {
    try {
      await updateSection.mutateAsync({
        pageType: activeTab,
        sectionName: selectedSection,
        data: data,
      });
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error("Error saving data:", error);
    }
  };

  const sections = getSections(activeTab);
  const sectionInfo = getSectionInfo(selectedSection);

  return (
    <div className="w-full mx-auto">
      <Breadcrumb />
      <div className="bg-white rounded-lg p-4">
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

{/* Content Area */}
<div className="grid grid-cols-12 gap-8 ">
  <Sidebar
    sections={sections}
    selectedSection={selectedSection}
    onSectionChange={handleSectionChange}
  />
  <FormContainer
    sectionInfo={sectionInfo}
    register={register}
    errors={errors}
    selectedSection={selectedSection}
    isSubmitting={isSubmitting || updateSection.isPending}
    onSubmit={handleSubmit(onSubmit)}
    setValue={setValue}
    watch={watch}
    isLoading={isLoading}
  />
</div>
        
      </div>
    
    </div>
  );
}; 