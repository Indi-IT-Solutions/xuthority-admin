import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { FormField } from '@/components/landing-pages-shared/forms/FormField';
import { BaseSectionForm } from '../../components/BaseSectionForm';
import { isValidUrl } from '@/utils/validation';

// Schema for reach more buyers section
export const reachMoreBuyersSchema = z.object({
  heading: z.string().min(1, "Heading is required").trim().max(200),
  subtext: z.string().min(1, "Subtext is required").trim().max(500),
  buttonText: z.string().min(1, "Button text is required").trim().max(30),
  buttonLink: z.string()
    .min(1, "Button link is required")
    .refine(isValidUrl, "Please enter a valid URL (e.g., https://example.com)"),
});

const ReachMoreBuyersFormContent: React.FC = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <>
      <FormField
        id="heading"
        label="Heading"
        placeholder="Write heading..."
        register={register}
        error={errors?.heading}
        maxLength={200}
      />

      <FormField
        id="subtext"
        label="Subtext"
        placeholder="Enter subtext here..."
        register={register}
        error={errors?.subtext}
        type="textarea"
        rows={4}
        maxLength={500}
      />

      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Add Button</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <FormField
            id="buttonText"
            label="Button Text"
            placeholder="Enter button text..."
            register={register}
            error={errors?.buttonText}
            maxLength={30}
          />

          <FormField
            id="buttonLink"
            label="Button Link"
            placeholder="https://example.com or https://your-website.com"
            register={register}
            error={errors?.buttonLink}
          />
        </div>
      </div>
    </>
  );
};

interface ReachMoreBuyersSectionProps {
  pageType: 'vendor';
}

export const ReachMoreBuyersSection: React.FC<ReachMoreBuyersSectionProps> = ({ pageType }) => {
  return (
    <BaseSectionForm
      pageType={pageType}
      sectionName="reachBuyers"
      schema={reachMoreBuyersSchema}
      title="Reach More Software Buyers"
      description="Add, edit data to Reach More Software Buyers on the homepage."
    >
      <ReachMoreBuyersFormContent />
    </BaseSectionForm>
  );
};