import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { FormField } from '@/components/landing-pages-shared/forms/FormField';
import { BaseSectionForm } from '../../components/BaseSectionForm';

// Schema for features section
export const featuresSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  subheading: z.string().optional(),
  features: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    icon: z.string().optional(),
  })).min(1, "At least one feature is required").max(6, "Maximum 6 features allowed")
});

interface FeatureData {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface FeatureItemProps {
  feature: FeatureData;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ feature, index, onRemove, canRemove }) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors?.features?.[index];

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">Feature {index + 1}</h3>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <FormField
        id={`features.${index}.title`}
        label="Title"
        placeholder="Enter feature title..."
        register={register}
        error={error?.title}
      />

      <FormField
        id={`features.${index}.description`}
        label="Description"
        placeholder="Enter feature description..."
        register={register}
        error={error?.description}
        textarea
        rows={3}
      />

      <FormField
        id={`features.${index}.icon`}
        label="Icon (optional)"
        placeholder="Enter icon name or URL..."
        register={register}
        error={error?.icon}
      />
    </div>
  );
};

const FeaturesFormContent: React.FC = () => {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const features = watch('features') || [{ id: '1', title: '', description: '', icon: '' }];

  const addFeature = () => {
    if (features.length >= 6) return;
    
    const newFeature = {
      id: Date.now().toString(),
      title: '',
      description: '',
      icon: '',
    };
    setValue('features', [...features, newFeature]);
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = features.filter((_: any, i: number) => i !== index);
    setValue('features', updatedFeatures);
  };

  return (
    <>
      <FormField
        id="heading"
        label="Section Heading"
        placeholder="Enter section heading..."
        register={register}
        error={errors?.heading}
      />

      <FormField
        id="subheading"
        label="Section Subheading (optional)"
        placeholder="Enter section subheading..."
        register={register}
        error={errors?.subheading}
      />

      <div className="space-y-6">
        {features.map((feature: FeatureData, index: number) => (
          <FeatureItem
            key={feature.id}
            feature={feature}
            index={index}
            onRemove={() => removeFeature(index)}
            canRemove={features.length > 1}
          />
        ))}

        {features.length < 6 && (
          <Button
            type="button"
            variant="ghost"
            onClick={addFeature}
            className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add More Features
          </Button>
        )}
      </div>

      {errors?.features && typeof errors.features === 'object' && errors.features.message && (
        <p className="text-sm text-red-500 mt-1">{errors.features.message}</p>
      )}
    </>
  );
};

interface FeaturesSectionProps {
  pageType: 'user' | 'vendor' | 'about';
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ pageType }) => {
  return (
    <BaseSectionForm
      pageType={pageType}
      sectionName="features"
      schema={featuresSchema}
      title="Features Section"
      description="Manage the key features displayed on the landing page."
    >
      <FeaturesFormContent />
    </BaseSectionForm>
  );
};