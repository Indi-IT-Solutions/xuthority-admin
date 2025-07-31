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
import { useProductsBySoftware } from '@/hooks/useProductsBySoftware';

// Schema for categories section
export const categoriesSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Software selection is required"),
    products: z.array(z.string()).min(1, "At least one product is required").max(9, "Maximum 9 products allowed"),
  })).min(1, "At least one category is required"),
});

interface CategoryData {
  id: string;
  name: string; // This stores the software ID
  products: string[]; // Array of product IDs (max 9)
}

interface CategoryItemProps {
  category: CategoryData;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  selectedSoftwareIds: string[]; // Track all selected software IDs
  initialProductData?: { id: string; name: string; logo?: string }[]; // Initial product data from backend
}

const CategoryItem: React.FC<CategoryItemProps> = ({ 
  category,
  index, 
  onRemove, 
  canRemove, 
  selectedSoftwareIds,
  initialProductData 
}) => {
  const { watch, formState: { errors }, setValue } = useFormContext();
  
  // Watch the current software selection
  const selectedSoftware = watch(`categories.${index}.name`);
  
  // Get software options for dropdown
  const { options: softwareOptions, isLoading: softwareLoading } = useSoftwareOptions(1, 100);
  
  // Filter out already selected software (except current selection)
  const filteredSoftwareOptions = React.useMemo(() => {
    return softwareOptions.filter((option: { value: string; label: string }) => {
      // Always show the current selection
      if (option.value === selectedSoftware) return true;
      // Hide if already selected in another category
      return !selectedSoftwareIds.includes(option.value);
    });
  }, [softwareOptions, selectedSoftwareIds, selectedSoftware]);
  
  // Track previous software selection to detect changes
  const prevSoftwareRef = React.useRef(selectedSoftware);
  
  // Clear product field when software changes
  React.useEffect(() => {
    if (prevSoftwareRef.current && prevSoftwareRef.current !== selectedSoftware) {
      setValue(`categories.${index}.products`, []);
    }
    prevSoftwareRef.current = selectedSoftware;
  }, [selectedSoftware, setValue, index]);
  
  // Get products for the selected software - only when software is selected
  const { options: productOptions, isLoading: productsLoading } = useProductsBySoftware(selectedSoftware);
  
  // Merge initial product data with API options to ensure selected products show names
  const mergedProductOptions = React.useMemo(() => {
    const optionsMap = new Map<string, { value: string; label: string; slug?: string }>();
    
    // First add all product options from API
    productOptions.forEach((opt: { value: string; label: string; slug?: string }) => {
      optionsMap.set(opt.value, opt);
    });
    
    // Only add initial product data if API returned some data or if we're still loading
    // This prevents showing stale cached data when API returns empty results
    if (productsLoading) {
      // Show cached data while loading
      if (initialProductData && initialProductData.length > 0) {
        initialProductData.forEach(product => {
          if (!optionsMap.has(product.id)) {
            optionsMap.set(product.id, {
              value: product.id,
              label: product.name,
              slug: '' // We don't have slug from initial data
            });
          }
        });
      }
    } else if (productOptions.length > 0) {
      // Only show cached data if API returned some data
      if (initialProductData && initialProductData.length > 0) {
        initialProductData.forEach(product => {
          if (!optionsMap.has(product.id)) {
            optionsMap.set(product.id, {
              value: product.id,
              label: product.name,
              slug: '' // We don't have slug from initial data
            });
          }
        });
      }
    }
    // If API returned empty data and we're not loading, don't show any cached data
    
    return Array.from(optionsMap.values());
  }, [productOptions, initialProductData, productsLoading]);


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
          options={filteredSoftwareOptions}
          searchable
          disabled={softwareLoading}
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
            placeholder="Select products (max 9)..."
            options={mergedProductOptions}
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

interface CategoriesFormContentProps {
  productDataCache: Record<string, { id: string; name: string; logo?: string }[]>;
}

const CategoriesFormContent: React.FC<CategoriesFormContentProps> = ({ productDataCache }) => {
  const { control, watch, register, formState: { errors } } = useFormContext();
  
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
        {fields.map((field, index) => {
          const categoryField = field as CategoryData;
          const softwareId = categoryField.name;
          const initialProductData = productDataCache[softwareId] || [];
          
          return (
            <CategoryItem
              key={field.id}
              category={categoryField}
              index={index}
              onRemove={() => removeCategory(index)}
              canRemove={fields.length > 1}
              selectedSoftwareIds={selectedSoftwareIds}
              initialProductData={initialProductData}
            />
          );
        })}

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
  
  // Store product data from backend to preserve names
  const [productDataCache, setProductDataCache] = React.useState<Record<string, { id: string; name: string; logo?: string }[]>>({});

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
      
      // Build product data cache from backend response
      const newProductCache: Record<string, { id: string; name: string; logo?: string }[]> = {};
      
      // Transform backend data to frontend format
      const transformedData = {
        heading: sectionData.heading || '',
        categories: sectionData.categories?.map((cat: any, index: number) => {
          // Handle populated name field (software)
          const softwareId = typeof cat.name === 'object' && cat.name?._id 
            ? cat.name._id 
            : cat.name || '';
          
          // Handle products - check if it's an array or single value
          let productsArray: any[] = [];
          if (cat.products) {
            if (Array.isArray(cat.products)) {
              productsArray = cat.products;
            } else if (typeof cat.products === 'string') {
              // Single product ID as string
              productsArray = [cat.products];
            } else if (typeof cat.products === 'object' && cat.products._id) {
              // Single populated product object
              productsArray = [cat.products];
            }
          }
          
          // Store product data for this category
          if (productsArray.length > 0 && softwareId) {
            const productsData = productsArray.map((product: any) => {
              if (typeof product === 'string') {
                return { id: product, name: product }; // Fallback if just ID
              }
              return {
                id: product._id || product.id || '',
                name: product.name || '',
                logo: product.logo || product.logoUrl || ''
              };
            });
            newProductCache[softwareId] = productsData;
          }
          
          // Extract product IDs from the full product objects
          const productIds = productsArray.map((product: any) => {
            if (typeof product === 'string') return product;
            return product._id || product.id || '';
          }).filter(Boolean);

          console.log(`Category ${index} transformation:`, {
            original: cat,
            transformed: {
              id: cat.id || `category-${index}`,
              name: softwareId,
              products: productIds,
            }
          });

          return {
            id: cat.id || `category-${index}`,
            name: softwareId, // This is the software ID
            products: productIds,
          };
        }) || [{ id: '1', name: '', products: [] }],
      };

      console.log('Transformed data for form reset:', transformedData);
      console.log('Product data cache:', newProductCache);
      
      setProductDataCache(newProductCache);
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
          products: Array.isArray(cat.products) ? cat.products : [], // Keep as product IDs array
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
          <CategoriesFormContent productDataCache={productDataCache} />

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