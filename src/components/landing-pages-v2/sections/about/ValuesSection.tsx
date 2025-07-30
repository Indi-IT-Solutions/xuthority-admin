import React from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/landing-pages-shared/forms/FormField';
import { Plus, Trash2 } from 'lucide-react';
import { useLandingPageSection, useUpdateLandingPageSection } from '../../hooks/useLandingPageSection';
import { isValidUrl } from '@/utils/validation';
import toast from 'react-hot-toast';

// Schema for values section with dynamic cards
export const valuesSchema = z.object({
  cards: z.array(z.object({
    id: z.string(),
    heading: z.string().trim().min(1, "Heading is required"),
    subtext: z.string().trim().min(1, "Subtext is required"),
  })).min(1, "At least one card is required"),
  buttonText: z.string().trim().min(1, "Button text is required"),
  buttonLink: z.string()
    .trim()
    .min(1, "Button link is required")
    .refine(isValidUrl, "Please enter a valid URL (e.g., https://example.com)"),
});

interface CardData {
  id: string;
  heading: string;
  subtext: string;
}

type FormData = {
  cards: CardData[];
  buttonText: string;
  buttonLink: string;
};

interface ValuesSectionProps {
  pageType: 'about';
}

export const ValuesSection: React.FC<ValuesSectionProps> = ({ pageType }) => {
  const { data: sectionData, isLoading } = useLandingPageSection(pageType, 'values');
  const updateSection = useUpdateLandingPageSection();

  const defaultCard: CardData = {
    id: Date.now().toString(),
    heading: '',
    subtext: '',
  };

  const methods = useForm<FormData>({
    resolver: zodResolver(valuesSchema),
    defaultValues: {
      cards: [defaultCard],
      buttonText: '',
      buttonLink: '',
    },
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    reset,
    register,
    control,
    formState: { isSubmitting, errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'cards',
  });

  // Reset form when section data is loaded
  React.useEffect(() => {
    if (sectionData && Object.keys(sectionData).length > 0) {
      console.log('Loaded values section data:', sectionData);
      
      // Handle both old format (values array) and new format (cards array)
      if (sectionData.values && Array.isArray(sectionData.values)) {
        // Convert from old format
        const cards: CardData[] = sectionData.values.map((value: any, index: number) => ({
          id: value.id || `card-${index}`,
          heading: value.title || value.heading || '',
          subtext: value.description || value.subtext || '',
        }));
        
        const formData = {
          cards: cards.length > 0 ? cards : [defaultCard],
          buttonText: sectionData.buttonText || '',
          buttonLink: sectionData.buttonLink || '',
        };
        console.log('Converted data from old format:', formData);
        reset(formData);
      } else {
        // Use new format directly
        const formData = {
          cards: sectionData.cards?.map((card: any, index: number) => ({
            ...card,
            id: card.id || `card-${index}`,
          })) || [defaultCard],
          buttonText: sectionData.buttonText || '',
          buttonLink: sectionData.buttonLink || '',
        };
        console.log('Using data in new format:', formData);
        reset(formData);
      }
    }
  }, [sectionData, reset]);

  const addCard = () => {
    append({
      id: Date.now().toString(),
      heading: '',
      subtext: '',
    });
  };

  const removeCard = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Trim all string values before submitting
      const trimmedData = {
        cards: data.cards.map(card => ({
          id: card.id,
          heading: card.heading.trim(),
          subtext: card.subtext.trim(),
        })),
        buttonText: data.buttonText.trim(),
        buttonLink: data.buttonLink.trim(),
      };

      console.log('Submitting values section data:', trimmedData);
      
      await updateSection.mutateAsync({
        pageType,
        sectionName: 'values',
        data: trimmedData,
      });
      
      
      // Log to verify data was saved
      console.log('Data saved successfully. Refresh the page to verify it loads correctly.');
    } catch (error) {
      console.error('Failed to update section:', error);
      toast.error('Failed to update section');
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
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2 sm:mb-3 text-gray-900">Our Values Section</h2>
        <p className="text-sm sm:text-base text-gray-600">Add, edit, or reorder the values cards displayed on the about page.</p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          {/* Cards Section */}
          <div className="space-y-4 sm:space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">Value {index + 1}</h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCard(index)}
                      className="text-red-500 hover:text-red-600 p-1 sm:p-2"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  )}
                </div>

                <input type="hidden" {...register(`cards.${index}.id`)} />

                <FormField
                  id={`cards.${index}.heading`}
                  label="Heading"
                  placeholder="Write heading..."
                  register={register}
                  error={errors?.cards?.[index]?.heading}
                />

                <FormField
                  id={`cards.${index}.subtext`}
                  label="Subtext"
                  placeholder="Enter subtext here..."
                  register={register}
                  error={errors?.cards?.[index]?.subtext}
                  type="textarea"
                  rows={3}
                />
              </div>
            ))}

            <Button
              type="button"
              variant="ghost"
              onClick={addCard}
              className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              Add More
            </Button>
          </div>

          {errors?.cards && typeof errors.cards === 'object' && 'message' in errors.cards && (
            <p className="text-sm text-red-500 mt-1">{String(errors.cards.message)}</p>
          )}

          <hr className="border-gray-200" />

          {/* Button Section */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Add Button</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                id="buttonText"
                label="Button Text"
                placeholder="Enter button text..."
                register={register}
                error={errors?.buttonText}
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