import React from 'react';
import { useForm, FormProvider, useFormContext, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { FormField } from '@/components/landing-pages-shared/forms/FormField';
import { FormSelectEnhanced } from '@/components/ui/FormSelectEnhanced';
import { useLandingPageSection, useUpdateLandingPageSection } from '../../hooks/useLandingPageSection';
import { useSoftwareAndSolutionOptions } from '@/hooks/useSoftwareAndSolutionOptions';
import { useProductsBySoftwareOrSolution } from '@/hooks/useProductsBySoftwareOrSolution';
import toast from 'react-hot-toast';

// Schema for popular section
export const popularSchema = z.object({
  heading: z.string().min(1, "Heading is required").trim().max(200),
  subtext: z.string().min(1, "Subtext is required").trim().max(500),
  solutions: z.array(z.object({
    id: z.string(),
    software: z.string().optional(),
    solution: z.string().optional(),
    products: z.array(z.string()).min(1, "At least one product is required").max(4, "Maximum 4 products allowed"),
    tempSelection: z.string().optional(),
  }).refine(data => data.software || data.solution, {
    message: "Either software or solution must be selected"
  })).min(1, "At least one item is required")
});

interface SolutionData {
  id: string;
  software?: string;
  solution?: string;
  products: string[];
  tempSelection?: string;
}

interface SolutionItemProps {
  solution: SolutionData;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  selectedItems: string[];
  initialProductData?: { id: string; name: string; logo?: string }[];
}

const SolutionItem: React.FC<SolutionItemProps> = ({
  solution,
  index,
  onRemove,
  canRemove,
  selectedItems,
  initialProductData
}) => {
  const { setValue, watch, formState: { errors }, control } = useFormContext();

  // Get combined software and solution options
  const { options: softwareSolutionOptions, isLoading: optionsLoading } = useSoftwareAndSolutionOptions();

  // Watch the current solution data
  const watchedSolution = watch(`solutions.${index}`);
  const currentSelection = watchedSolution?.software 
    ? `software_${watchedSolution.software}` 
    : watchedSolution?.solution 
    ? `solution_${watchedSolution.solution}`
    : '';
    
  // Set initial tempSelection value
  React.useEffect(() => {
    if (currentSelection && !watchedSolution?.tempSelection) {
      setValue(`solutions.${index}.tempSelection`, currentSelection);
    }
  }, [currentSelection, watchedSolution?.tempSelection, setValue, index]);

  // Track previous selection to detect changes
  const prevSelectionRef = React.useRef(currentSelection);

  // Watch the temp selection for changes
  const tempSelection = watch(`solutions.${index}.tempSelection`);
  
  // Handle selection changes
  React.useEffect(() => {
    if (tempSelection) {
      if (tempSelection.startsWith('software_')) {
        const softwareId = tempSelection.replace('software_', '');
        setValue(`solutions.${index}.software`, softwareId);
        setValue(`solutions.${index}.solution`, undefined);
      } else if (tempSelection.startsWith('solution_')) {
        const solutionId = tempSelection.replace('solution_', '');
        setValue(`solutions.${index}.solution`, solutionId);
        setValue(`solutions.${index}.software`, undefined);
      }
    }
  }, [tempSelection, setValue, index]);
  
  // Clear products when selection changes
  React.useEffect(() => {
    if (prevSelectionRef.current && prevSelectionRef.current !== currentSelection && currentSelection) {
      setValue(`solutions.${index}.products`, []);
    }
    prevSelectionRef.current = currentSelection;
  }, [currentSelection, setValue, index]);

  // Filter out already selected items
  const availableOptions = React.useMemo(() => {
    return softwareSolutionOptions.filter(option =>
      !selectedItems.includes(option.value) || option.value === currentSelection
    );
  }, [softwareSolutionOptions, selectedItems, currentSelection]);

  // Get products for the selected software/solution
  const selectedId = watchedSolution?.software || watchedSolution?.solution || '';
  const { options: productOptions, isLoading: productsLoading } = useProductsBySoftwareOrSolution(
    selectedId
  );

  // Merge initial product data with API options
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
              slug: ''
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
              slug: ''
            });
          }
        });
      }
    }
    // If API returned empty data and we're not loading, don't show any cached data
    
    return Array.from(optionsMap.values());
  }, [productOptions, initialProductData, productsLoading]);

  // We don't need handleSelectionChange anymore since FormSelectEnhanced uses Controller

  const error = errors?.solutions?.[index];

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">Item {index + 1}</h3>
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

      <div className="space-y-2">
        <FormSelectEnhanced
          name={`solutions.${index}.tempSelection`}
          label="Software or Solution *"
          placeholder="Select software or solution..."
          options={availableOptions}
          searchable
          disabled={optionsLoading}
        />
        {error && typeof error === 'object' && 'message' in error && (
          <p className="text-sm text-red-500">{error.message}</p>
        )}
      </div>

      {selectedId && (
        <div className="space-y-2">
          <FormSelectEnhanced
            name={`solutions.${index}.products`}
            label="Products *"
            placeholder="Select products (max 4)..."
            options={mergedProductOptions}
            multiple
            maxSelections={4}
            disabled={productsLoading}
            searchable
          />
          {error?.products && (
            <p className="text-sm text-red-500">{error.products?.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

interface PopularFormContentProps {
  productDataCache: Record<string, { id: string; name: string; logo?: string }[]>;
}

const PopularFormContent: React.FC<PopularFormContentProps> = ({ productDataCache }) => {
  const { control, register, watch, formState: { errors } } = useFormContext();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'solutions',
  });

  // Watch all selections to prevent duplicates
  const solutions = watch('solutions') || [];
  const selectedItems = solutions.map((sol: any) => {
    if (sol.software) return `software_${sol.software}`;
    if (sol.solution) return `solution_${sol.solution}`;
    return '';
  }).filter(Boolean);

  const addSolution = () => {
    append({
      id: Date.now().toString(),
      software: '',
      solution: '',
      products: [],
      tempSelection: '',
    });
  };

  const removeSolution = (index: number) => {
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
      <div className="space-y-6">
        {fields.map((field, index) => {
          const solutionField = field as SolutionData;
          const itemId = solutionField.software || solutionField.solution || '';
          const initialProductData = productDataCache[itemId] || [];
          
          return (
            <SolutionItem
              key={field.id}
              solution={solutionField}
              index={index}
              onRemove={() => removeSolution(index)}
              canRemove={fields.length > 1}
              selectedItems={selectedItems}
              initialProductData={initialProductData}
            />
          );
        })}

        <Button
          type="button"
          variant="ghost"
          onClick={addSolution}
          className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add More
        </Button>
      </div>

      {errors?.solutions && typeof errors.solutions === 'object' && 'message' in errors.solutions && (
        <p className="text-sm text-red-500 mt-1">{String(errors.solutions.message)}</p>
      )}
    </>
  );
};

interface PopularSectionProps {
  pageType: 'user' | 'vendor' | 'about';
}

export const PopularSection: React.FC<PopularSectionProps> = ({ pageType }) => {
  const { data: sectionData, isLoading } = useLandingPageSection(pageType, 'popular');
  const updateSection = useUpdateLandingPageSection();
  
  // Store product data from backend to preserve names
  const [productDataCache, setProductDataCache] = React.useState<Record<string, { id: string; name: string; logo?: string }[]>>({});

  const methods = useForm({
    resolver: zodResolver(popularSchema),
    defaultValues: {
      heading: '',
      subtext:'',
      solutions: [{ id: '1', software: '', solution: '', products: [], tempSelection: '' }]
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
      console.log('Loaded popular section data:', sectionData);
      
      // Build product data cache from backend response
      const newProductCache: Record<string, { id: string; name: string; logo?: string }[]> = {};
      
      // Transform backend data to frontend format
      const transformedData = {
        heading: sectionData.heading || '',
        subtext:sectionData.subtext || '',
        solutions: sectionData.solutions?.map((sol: any, index: number) => {
          // Determine if it's software or solution
          const softwareId = typeof sol.software === 'object' && sol.software?._id 
            ? sol.software._id 
            : sol.software || '';
          
          const solutionId = typeof sol.solution === 'object' && sol.solution?._id 
            ? sol.solution._id 
            : sol.solution || '';
          
          const itemId = softwareId || solutionId;
          
          // Handle products array
          let productsArray: any[] = [];
          if (sol.products && Array.isArray(sol.products)) {
            productsArray = sol.products;
          }
          
          // Store product data for this item
          if (productsArray.length > 0 && itemId) {
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
            newProductCache[itemId] = productsData;
          }
          
          // Extract product IDs from the full product objects
          const productIds = productsArray.map((product: any) => {
            if (typeof product === 'string') return product;
            return product._id || product.id || '';
          }).filter(Boolean);

          console.log(`Solution ${index} transformation:`, {
            original: sol,
            transformed: {
              id: sol.id || `solution-${index}`,
              software: softwareId,
              solution: solutionId,
              products: productIds,
            }
          });

          // Set tempSelection based on whether it's software or solution
          const tempSelection = softwareId 
            ? `software_${softwareId}` 
            : solutionId 
            ? `solution_${solutionId}` 
            : '';

          return {
            id: sol.id || `solution-${index}`,
            software: softwareId || undefined,
            solution: solutionId || undefined,
            products: productIds,
            tempSelection: tempSelection,
          };
        }) || [{ id: '1', software: '', solution: '', products: [], tempSelection: '' }],
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
        subtext:data.subtext,
        solutions: data.solutions.map((sol: any) => ({
          id: sol.id,
          software: sol.software || undefined,
          solution: sol.solution || undefined,
          products: Array.isArray(sol.products) ? sol.products : [],
        })).filter((sol: any) => sol.software || sol.solution),
      };

      console.log('Submitting popular data:', transformedData);

      await updateSection.mutateAsync({
        pageType,
        sectionName: 'popular',
        data: transformedData,
      });

    } catch (error) {
      console.error('Failed to update section:', error);
      toast.error('Failed to update popular section');
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
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2 sm:mb-3 text-gray-900">Most Popular Software Solutions</h2>
        <p className="text-sm sm:text-base text-gray-600">Select software or solutions and their associated products to display on the homepage.</p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          <PopularFormContent productDataCache={productDataCache} />

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