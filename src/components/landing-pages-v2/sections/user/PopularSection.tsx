import React from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { FormField } from '@/components/landing-pages-shared/forms/FormField';
import { FormSelectEnhanced } from '@/components/ui/FormSelectEnhanced';

// Schema for popular section
export const popularSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  solutions: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Software/Solution selection is required"),
    types: z.array(z.string()).min(1, "At least one product is required")
  })).min(1, "At least one item is required")
});

interface SolutionData {
  id: string;
  name: string;
  types: string[];
}

interface SolutionItemProps {
  solution: SolutionData;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  selectedItems: string[];
  softwareSolutionOptions: { value: string; label: string }[];
  productOptions: { value: string; label: string }[];
  optionsLoading: boolean;
  productsLoading: boolean;
}

const SolutionItem: React.FC<SolutionItemProps> = ({
  solution,
  index,
  onRemove,
  canRemove,
  selectedItems,
  softwareSolutionOptions,
  productOptions,
  optionsLoading,
  productsLoading,
}) => {
  const { setValue, watch, formState: { errors } } = useFormContext();

  const selectedValue = watch(`solutions.${index}.name`);
  const currentId = selectedValue || '';
  const actualId = currentId.includes('_') ? currentId.split('_')[1] : currentId;

  // Filter out already selected items
  const availableOptions = React.useMemo(() => {
    return softwareSolutionOptions.filter(option =>
      !selectedItems.includes(option.value) || option.value === currentId
    );
  }, [softwareSolutionOptions, selectedItems, currentId]);

  const error = errors?.solutions?.[index];

  // Handle selection change and reset products
  const previousValueRef = React.useRef(selectedValue);
  React.useEffect(() => {
    if (selectedValue !== previousValueRef.current) {
      setValue(`solutions.${index}.types`, []);
      previousValueRef.current = selectedValue;
    }
  }, [selectedValue, index, setValue]);

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

      <FormSelectEnhanced
        name={`solutions.${index}.name`}
        label="Software or Solution"
        placeholder="Select software or solution"
        options={availableOptions}
        searchable
        disabled={optionsLoading}
      />
      {error?.name && (
        <p className="text-sm text-red-500 -mt-3 mb-4">{error.name.message}</p>
      )}

      <FormSelectEnhanced
        name={`solutions.${index}.types`}
        label="Products"
        placeholder={
          !actualId
            ? "Please select software/solution first"
            : productsLoading
              ? "Loading products..."
              : `Select products (max. 9 products) - ${productOptions.length} available`
        }
        options={productOptions}
        multiple
        maxSelections={9}
        disabled={!actualId || productsLoading}
        searchable
        preserveSelectedLabels={true}
      />
      {productsLoading && actualId && (
        <p className="text-sm text-blue-500 -mt-3 mb-4">
          Loading products for selected item...
        </p>
      )}
      {error?.types && (
        <p className="text-sm text-red-500 -mt-3 mb-4">
          {typeof error.types === 'object' && 'message' in error.types
            ? (typeof error.types.message === 'string' ? error.types.message : 'Please select products')
            : 'Please select products'}
        </p>
      )}
    </div>
  );
};

interface PopularFormContentProps {
  onImageChange: (index: number, file: File | null) => void;
  softwareSolutionOptions: { value: string; label: string }[];
  productOptionsMap: Record<string, { value: string; label: string }[]>;
  optionsLoading: boolean;
  productsLoadingMap: Record<string, boolean>;
}

const PopularFormContent: React.FC<PopularFormContentProps> = ({
  onImageChange: onImageChangeFromParent,
  softwareSolutionOptions,
  productOptionsMap,
  optionsLoading,
  productsLoadingMap,
}) => {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const watchedSolutions = watch('solutions');

  // Ensure solutions is always an array with proper structure
  const solutions = React.useMemo(() => {
    if (!watchedSolutions || !Array.isArray(watchedSolutions) || watchedSolutions.length === 0) {
      return [{ id: '1', name: '', types: [] }];
    }
    return watchedSolutions.map(sol => ({
      id: typeof sol.id === 'string' ? sol.id : String(sol.id || Date.now()),
      name: typeof sol.name === 'string' ? sol.name : String(sol.name || ''),
      types: Array.isArray(sol.types) ? sol.types : []
    }));
  }, [watchedSolutions]);

  // Get all selected items
  const selectedItems = React.useMemo(() => {
    return solutions
      .map(sol => sol.name)
      .filter(name => name && name.includes('_'));
  }, [solutions]);

  const addSolution = () => {
    const newSolution = {
      id: Date.now().toString(),
      name: '',
      types: [],
    };
    setValue('solutions', [...solutions, newSolution]);
  };

  const removeSolution = (index: number) => {
    const updatedSolutions = solutions.filter((_: any, i: number) => i !== index);
    setValue('solutions', updatedSolutions);
    onImageChangeFromParent(index, null);
  };

  const handleImageChange = (index: number, file: File | null) => {
    onImageChangeFromParent(index, file);
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

      <div className="space-y-6">
        {solutions.map((solution: SolutionData, index: number) => {
          const currentId = solution.name || '';
          const actualId = currentId.includes('_') ? currentId.split('_')[1] : currentId;
          const productOptions = productOptionsMap[actualId] || [];
          const productsLoading = productsLoadingMap[actualId] || false;

          return (
            <SolutionItem
              key={solution.id}
              solution={solution}
              index={index}
              onRemove={() => removeSolution(index)}
              canRemove={solutions.length > 1}
              selectedItems={selectedItems}
              softwareSolutionOptions={softwareSolutionOptions}
              productOptions={productOptions}
              optionsLoading={optionsLoading}
              productsLoading={productsLoading}
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
        <p className="text-sm text-red-500 mt-1">
          {typeof errors.solutions.message === 'string' ? errors.solutions.message : 'Please fix the form errors'}
        </p>
      )}
    </>
  );
};

interface PopularSectionProps {
  pageType: 'user' | 'vendor' | 'about';
}

const MOCK_SOFTWARE_SOLUTION_OPTIONS = [
  { value: 'software_1', label: 'Software One' },
  { value: 'software_2', label: 'Software Two' },
  { value: 'solution_3', label: 'Solution Three' },
];

const MOCK_PRODUCT_OPTIONS = {
  '1': [
    { value: 'prod_1a', label: 'Product 1A' },
    { value: 'prod_1b', label: 'Product 1B' },
  ],
  '2': [
    { value: 'prod_2a', label: 'Product 2A' },
    { value: 'prod_2b', label: 'Product 2B' },
  ],
  '3': [
    { value: 'prod_3a', label: 'Product 3A' },
    { value: 'prod_3b', label: 'Product 3B' },
  ],
};

export const PopularSection: React.FC<PopularSectionProps> = ({ pageType }) => {
  // Mock loading state and data
  const [isLoading, setIsLoading] = React.useState(false);
  const [softwareSolutionOptions] = React.useState(MOCK_SOFTWARE_SOLUTION_OPTIONS);
  const [productOptionsMap] = React.useState(MOCK_PRODUCT_OPTIONS);
  const [optionsLoading] = React.useState(false);
  const [productsLoadingMap] = React.useState<{ [key: string]: boolean }>({});

  const methods = useForm({
    resolver: zodResolver(popularSchema),
    defaultValues: {
      heading: '',
      solutions: [{ id: '1', name: '', types: [] }]
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  // No API: just log the data
  const onSubmit = (data: any) => {
    // Transform frontend data to backend format
    const transformedData = {
      heading: data.heading,
      solutions: data.solutions.map((sol: any) => {
        const frontendValue = sol.name;
        const backendId = frontendValue.includes('_') ? frontendValue.split('_')[1] : frontendValue;
        return {
          id: sol.id,
          name: backendId,
          types: Array.isArray(sol.types) ? sol.types : []
        };
      }).filter((sol: any) => sol.name)
    };
    // eslint-disable-next-line no-console
    console.log('Form submitted:', transformedData);
    // No toast, no API
  };

  const handleImageChange = (index: number, file: File | null) => {
    // No file upload
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
          <PopularFormContent
            onImageChange={handleImageChange}
            softwareSolutionOptions={softwareSolutionOptions}
            productOptionsMap={productOptionsMap}
            optionsLoading={optionsLoading}
            productsLoadingMap={productsLoadingMap}
          />

          <div className="flex justify-center pt-6 sm:pt-8">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-full font-medium text-lg sm:text-xl w-full transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save & Update"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};