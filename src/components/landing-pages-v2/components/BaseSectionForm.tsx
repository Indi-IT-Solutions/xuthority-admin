import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useLandingPageSection, useUpdateLandingPageSection, PageType } from '../hooks/useLandingPageSection';

interface BaseSectionFormProps {
  pageType: PageType;
  sectionName: string;
  schema: z.ZodSchema<any>;
  children: React.ReactNode;
  title: string;
  description: string;
}

export const BaseSectionForm: React.FC<BaseSectionFormProps> = ({
  pageType,
  sectionName,
  schema,
  children,
  title,
  description,
}) => {
  const { data: sectionData, isLoading } = useLandingPageSection(pageType, sectionName);
  const updateSection = useUpdateLandingPageSection();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: sectionData || {},
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Reset form when section data is loaded
  React.useEffect(() => {
    if (sectionData && Object.keys(sectionData).length > 0) {
      let transformedData = sectionData;
      
      // Transform categories data if needed
      if (sectionName === 'categories' && sectionData.categories) {
        transformedData = {
          ...sectionData,
          categories: sectionData.categories.map((cat: any) => ({
            ...cat,
            // Convert products array to just IDs for FormSelect
            products: Array.isArray(cat.products) 
              ? cat.products.map((p: any) => {
                  if (typeof p === 'string') return p;
                  if (typeof p === 'object' && p !== null) {
                    return p._id || p.id || '';
                  }
                  return '';
                }).filter(id => id !== '')
              : []
          }))
        };
      }
      
      // Transform popular section data if needed
      if (sectionName === 'popular' && sectionData.solutions) {
        transformedData = {
          ...sectionData,
          solutions: sectionData.solutions.map((sol: any) => ({
            ...sol,
            // Convert types array to just IDs for FormSelect
            types: Array.isArray(sol.types) 
              ? sol.types.map((t: any) => {
                  if (typeof t === 'string') return t;
                  if (typeof t === 'object' && t !== null) {
                    return t._id || t.id || '';
                  }
                  return '';
                }).filter(id => id !== '')
              : []
          }))
        };
      }
      
      reset(transformedData);
    }
  }, [sectionData, reset, sectionName]);

  const onSubmit = async (data: any) => {
    try {
      // Transform data if needed
      let transformedData = data;
      
      // For categories section, ensure proper data structure
      if (sectionName === 'categories' && data.categories) {
        transformedData = {
          ...data,
          categories: data.categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name, // This is the software ID from FormSelect
            products: Array.isArray(cat.products) ? cat.products : []
          }))
        };
      }
      
      // For popular section, ensure proper data structure
      if (sectionName === 'popular' && data.solutions) {
        transformedData = {
          ...data,
          solutions: data.solutions.map((sol: any) => ({
            id: sol.id,
            name: sol.name, // This contains "software_id" or "solution_id"
            types: Array.isArray(sol.types) ? sol.types : []
          }))
        };
      }
      
      // For reachMoreBuyers section, ensure proper data structure
      if (sectionName === 'reachMoreBuyers') {
        transformedData = {
          ...data,
          buttonText: data.buttonText || '',
          buttonLink: data.buttonLink || ''
        };
      }
      
      console.log(`Submitting ${sectionName} data:`, transformedData);
      
      await updateSection.mutateAsync({
        pageType,
        sectionName,
        data: transformedData,
      });
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2 sm:mb-3 text-gray-900">{title}</h2>
        <p className="text-sm sm:text-base text-gray-600">{description}</p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          {children}

          <div className="flex justify-center pt-6 sm:pt-8">
            <Button
              type="submit"
              disabled={isSubmitting || updateSection.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-full font-medium text-lg sm:text-xl w-full transition-colors"
            >
              {isSubmitting || updateSection.isPending ? "Saving..." : "Save & Update"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};