import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { FormField } from '@/components/landing-pages-shared/forms/FormField';
import { BaseSectionForm } from '../../components/BaseSectionForm';

// Schema for hero section
export const heroSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  subtext: z.string().min(1, "Subtext is required"),
});

const HeroFormContent: React.FC = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <>
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
    </>
  );
};

interface HeroSectionProps {
  pageType: 'about';
}

export const HeroSection: React.FC<HeroSectionProps> = ({ pageType }) => {
  return (
    <BaseSectionForm
      pageType={pageType}
      sectionName="hero"
      schema={heroSchema}
      title="Hero Section"
      description="Edit the main headline and subtext shown on the about page."
    >
      <HeroFormContent />
    </BaseSectionForm>
  );
}; 