import React from 'react';
import { useForm, FormProvider, useFieldArray, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/landing-pages-shared/forms/FormField';
import { FormSelectEnhanced } from '@/components/ui/FormSelectEnhanced';
import { Plus, Trash2 } from 'lucide-react';
import { useLandingPageSection, useUpdateLandingPageSection } from '../../hooks/useLandingPageSection';
import { useSoftwareOptions } from '@/hooks/useSoftwareOptions';
import { useProductsBySoftwareOrSolution } from '@/hooks/useProductsBySoftwareOrSolution';
import toast from 'react-hot-toast';

// Schema for categories section
export const categoriesSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Software selection is required"),
    products: z.array(z.string()).min(1, "At least one product is required"),
  })).min(1, "At least one category is required"),
});

interface CategoryData {
  id: string;
  name: string; // This stores the software ID
  products: string[]; // Array of product IDs
}

interface CategoryItemProps {
  category: CategoryData;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  selectedSoftwareIds: string[]; // Track all selected software IDs
}

const CategoryItem: React.FC<CategoryItemProps> = ({ 
  category, 
  index, 
  onRemove, 
  canRemove, 
  selectedSoftwareIds 
}) => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  
  // Watch the current software selection
  const selectedSoftware = watch(`categories.${index}.name`);
  
  // Get software options for dropdown
  const { options: softwareOptions, isLoading: softwareLoading } = useSoftwareOptions(1, 100);
  
  // Get products for the selected software - only when software is selected
  const { options: productOptions, isLoading: productsLoading } = useProductsBySoftwareOrSolution(
    selectedSoftware,
    !!selectedSoftware && selectedSoftware.trim() !== ''
  );

  // Handle software selection change
  const handleSoftwareChange = (softwareId: string) => {
    console.log(`Software changed for category ${index}:`, softwareId);
    
    // Clear products when software changes
    setValue(`categories.${index}.products`, []);
    
    // Update the software selection
    setValue(`categories.${index}.name`, softwareId);
  };

  // Handle product selection change
  const handleProductsChange = (productIds: string[]) => {
    console.log(`Products changed for category ${index}:`, productIds);
    setValue(`categories.${index}.products`, productIds);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex justify-between items-start">
        <h3 className="text-base sm:text-lg font-medium text-gray-900">Category {index + 1}</h3>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-600 p-1 sm:p-2"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        )}
      </div>

      {/* Software Selection */}
      <div className="space-y-2">
        <FormSelectEnhanced
          name={`categories.${index}.name`}
          label="Software *"
          placeholder="Select software..."
          options={softwareOptions}
          searchable
          disabled={softwareLoading || selectedSoftwareIds.filter(id => id !== selectedSoftware).includes(selectedSoftware)}
        />
        {errors?.categories?.[index]?.name && (
          <p className="text-sm text-red-500">{errors.categories[index]?.name?.message}</p>
        )}
      </div>

      {/* Products Selection */}
      {selectedSoftware && (
        <div className="space-y-2">
          <FormSelectEnhanced
            name={`categories.${index}.products`}
            label="Products *"
            placeholder="Select products..."
            options={productOptions}
            searchable
            multiple
            maxSelections={9}
            disabled={productsLoading}
          />
          {errors?.categories?.[index]?.products && (
            <p className="text-sm text-red-500">{errors.categories[index]?.products?.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

const CategoriesFormContent: React.FC = () => {
  const { control, watch, setValue, register, formState: { errors } } = useFormContext();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'categories',
  });

  // Watch all software selections to prevent duplicates
  const categories = watch('categories') || [];
  const selectedSoftwareIds = categories.map((cat: any) => cat.name).filter(Boolean);

  const addCategory = () => {
    append({
      id: Date.now().toString(),
      name: '',
      products: [],
    });
  };

  const removeCategory = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
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

      <div className="space-y-4 sm:space-y-6">
        {fields.map((field, index) => (
          <CategoryItem
            key={field.id}
            category={field as CategoryData}
            index={index}
            onRemove={() => removeCategory(index)}
            canRemove={fields.length > 1}
            selectedSoftwareIds={selectedSoftwareIds}
          />
        ))}

        <Button
          type="button"
          variant="ghost"
          onClick={addCategory}
          className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          Add More Categories
        </Button>
      </div>

      {errors?.categories && typeof errors.categories === 'object' && 'message' in errors.categories && (
        <p className="text-sm text-red-500 mt-1">{String(errors.categories.message)}</p>
      )}
    </>
  );
};

interface CategoriesSectionProps {
  pageType: 'user' | 'vendor' | 'about';
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ pageType }) => {
  const { data: sectionData, isLoading } = useLandingPageSection(pageType, 'categories');
  const updateSection = useUpdateLandingPageSection();

  const methods = useForm({
    resolver: zodResolver(categoriesSchema),
    defaultValues: {
      heading: '',
      categories: [{ id: '1', name: '', products: [] }]
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Reset form when section data is loaded
  React.useEffect(() => {
    if (sectionData && Object.keys(sectionData).length > 0) {
      console.log('Loaded categories section data:', sectionData);
      
      // Transform backend data to frontend format
      const transformedData = {
        heading: sectionData.heading || '',
        categories: sectionData.categories?.map((cat: any, index: number) => {
          // Extract product IDs from the full product objects
          const productIds = cat.products?.map((product: any) => {
            if (typeof product === 'string') return product;
            return product._id || product.id || '';
          }).filter(Boolean) || [];

          console.log(`Category ${index} transformation:`, {
            original: cat,
            transformed: {
              id: cat.id || `category-${index}`,
              name: cat.name || '',
              products: productIds,
            }
          });

          return {
            id: cat.id || `category-${index}`,
            name: cat.name || '', // This is the software ID
            products: productIds,
          };
        }) || [{ id: '1', name: '', products: [] }],
      };

      console.log('Transformed data for form reset:', transformedData);
      reset(transformedData);
    }
  }, [sectionData, reset]);

  const onSubmit = async (data: any) => {
    try {
      console.log('Form data before submission:', data);
      
      // Transform frontend data to backend format
      const transformedData = {
        heading: data.heading,
        categories: data.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name, // Keep as software ID
          products: Array.isArray(cat.products) ? cat.products : [], // Keep as product IDs
        })),
      };

      console.log('Submitting categories data:', transformedData);

      await updateSection.mutateAsync({
        pageType,
        sectionName: 'categories',
        data: transformedData,
      });

    } catch (error) {
      console.error('Failed to update section:', error);
      toast.error('Failed to update categories section');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4 sm:p-6">
        <div className="flex justify-center items-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2 sm:mb-3 text-gray-900">Software Categories Overview</h2>
        <p className="text-sm sm:text-base text-gray-600">Add, edit, or reorder the most popular software categories displayed on the homepage.</p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          <CategoriesFormContent />

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