import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/landing-pages-shared/forms/FormField';
import { useLandingPageSection, useUpdateLandingPageSection } from '../../hooks/useLandingPageSection';
import toast from 'react-hot-toast';

// Schema for hero section
export const heroSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  subtext: z.string().min(1, "Subtext is required"),
});

interface HeroSectionProps {
  pageType: 'vendor';
}

export const HeroSection: React.FC<HeroSectionProps> = ({ pageType }) => {
  const { data: sectionData, isLoading } = useLandingPageSection(pageType, 'hero');
  const updateSection = useUpdateLandingPageSection();

  const methods = useForm({
    resolver: zodResolver(heroSchema),
    defaultValues: sectionData || {
      heading: '',
      subtext: '',
    },
  });

  const {
    handleSubmit,
    reset,
    register,
    formState: { isSubmitting, errors },
  } = methods;

  // Reset form when section data is loaded
  React.useEffect(() => {
    if (sectionData && Object.keys(sectionData).length > 0) {
      reset(sectionData);
    }
  }, [sectionData, reset]);

  const onSubmit = async (data: any) => {
    try {
      console.log('Submitting hero section data:', data);
      
      await updateSection.mutateAsync({
        pageType,
        sectionName: 'hero',
        data,
      });
      
    } catch (error) {
      console.error('Failed to update hero section:', error);
      toast.error('Failed to update hero section');
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
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2 sm:mb-3 text-gray-900">Hero Section</h2>
        <p className="text-sm sm:text-base text-gray-600">Edit the main headline, subtext, and search functionality shown on the homepage.</p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          <FormField
            id="heading"
            label="Heading"
            placeholder="Write heading..."
            register={register}
            error={errors?.heading}
          />

          <FormField
            id="subtext"
            label="Subtext"
            placeholder="Enter subtext here..."
            register={register}
            error={errors?.subtext}
            type="textarea"
            rows={4}
          />

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