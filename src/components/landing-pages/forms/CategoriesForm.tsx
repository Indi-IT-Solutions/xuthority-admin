import { useState, useEffect, useRef, memo } from "react";
import { FormField } from "./FormField";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormProvider, useForm } from "react-hook-form";
import { useSoftwareOptions } from "@/hooks/useSoftwareOptions";
import { useProductsBySoftware } from "@/hooks/useProductsBySoftware";

interface CategoriesFormProps {
  register: any;
  errors: any;
  setValue?: any;
  watch?: any;
}


interface CategoryData {
  id: string;
  name: string;
  products: Array<{ id: string; name: string; logo?: string }>;
}

interface CategoryItemProps {
  category: CategoryData;
  index: number;
  totalCategories: number;
  onRemove: (categoryId: string) => void;
  softwareOptions: Array<{ value: string; label: string }>;
  softwareLoading: boolean;
  selectedSoftwareId: string;
  selectedSoftwareIds: Record<string, string>;
  error?: any;
  onProductsChange?: (categoryId: string, productOptions: Array<{ value: string; label: string }>) => void;
}

const CategoryItem = memo(({ 
  category, 
  index, 
  totalCategories, 
  onRemove, 
  softwareOptions, 
  softwareLoading,
  selectedSoftwareId,
  selectedSoftwareIds,
  error,
  onProductsChange
}: CategoryItemProps) => {
  const { options: productOptions, isLoading: productsLoading } = useProductsBySoftware(
    selectedSoftwareId,
    !!selectedSoftwareId
  );

  // Pass product options when they change
  useEffect(() => {
    if (onProductsChange && productOptions.length > 0) {
      onProductsChange(category.id, productOptions);
    }
  }, [productOptions, category.id, onProductsChange]);

  // Filter out already selected software options
  const availableOptions = softwareOptions.filter(option => {
    // Allow the current selection
    if (option.value === selectedSoftwareId) return true;
    // Filter out options already selected in other categories
    return !Object.values(selectedSoftwareIds).includes(option.value) || 
           selectedSoftwareIds[category.id] === option.value;
  });

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">Category {index + 1}</h3>
        {totalCategories > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(category.id)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <FormSelect
        name={`category-${category.id}`}
        label="Software Category"
        placeholder="Select software category"
        options={availableOptions}
        searchable
        disabled={softwareLoading}
      />
      {error?.name && (
        <p className="text-sm text-red-500 -mt-3 mb-4">{error.name.message}</p>
      )}

      <FormSelect
        name={`products-${category.id}`}
        label="Software Products"
        placeholder={selectedSoftwareId ? "Select software products (max. 9 products)" : "Please select a software category first"}
        options={productOptions}
        searchable
        multiple
        maxSelections={9}
        disabled={!selectedSoftwareId || productsLoading}
      />
      {error?.products && typeof error.products === 'object' && error.products.message && (
        <p className="text-sm text-red-500 -mt-3 mb-4">{error.products.message}</p>
      )}
    </div>
  );
});

CategoryItem.displayName = 'CategoryItem';

export const CategoriesForm: React.FC<CategoriesFormProps> = ({ register, errors, setValue, watch }) => {
  const [categories, setCategories] = useState<CategoryData[]>([
    {
      id: "1",
      name: "",
      products: [],
    },
  ]);
  const [selectedSoftwareIds, setSelectedSoftwareIds] = useState<Record<string, string>>({});
  const [productOptionsMap, setProductOptionsMap] = useState<Record<string, Array<{ value: string; label: string }>>>({});
  const dataLoadedRef = useRef(false);
  
  // Fetch software options from API
  const { options: softwareOptions, isLoading: softwareLoading } = useSoftwareOptions(1, 100);

  // Create form methods for FormSelect
  const methods = useForm({
    defaultValues: {
      'category-1': '', // Set initial value for the first category
      'products-1': [] // Initial products
    }
  });

  // Update form value when categories change
  useEffect(() => {
    if (setValue) {
      setValue("categories", categories);
    }
  }, [categories, setValue]);

  // Reset dataLoadedRef when component mounts or watch changes
  useEffect(() => {
    // Reset when component mounts or watch changes
    dataLoadedRef.current = false;
  }, [watch]);

  // Load categories from parent form when data changes
  useEffect(() => {
    if (!watch || softwareLoading || softwareOptions.length === 0) {
      return;
    }

    const subscription = watch((value, { name, type }) => {
      console.log('CategoriesForm - Form value changed:', name, type, value);
      
      if (name === 'categories' || type === 'change') {
        const watchedCategories = value.categories;
        console.log('CategoriesForm - categories from watch:', watchedCategories);
        
        if (watchedCategories && Array.isArray(watchedCategories) && watchedCategories.length > 0) {
          const hasData = watchedCategories.some(cat => cat.name || (cat.products && cat.products.length > 0));
          
          if (hasData && !dataLoadedRef.current) {
            console.log('CategoriesForm - Loading categories data');
            dataLoadedRef.current = true;
            setCategories(watchedCategories);
            
            // Initialize form fields for each category
            setTimeout(() => {
              watchedCategories.forEach((cat: CategoryData) => {
                console.log('Processing category:', cat);
                if (cat.name) {
                  const software = softwareOptions.find(opt => opt.label === cat.name);
                  console.log(`Looking for software "${cat.name}", found:`, software);
                  if (software) {
                    console.log(`Setting category-${cat.id} to:`, software.value);
                    methods.setValue(`category-${cat.id}` as any, software.value);
                    setSelectedSoftwareIds(prev => ({ ...prev, [cat.id]: software.value }));
                  }
                }
                if (cat.products && cat.products.length > 0) {
                  const productIds = cat.products.map(p => p.id);
                  console.log(`Setting products-${cat.id} to:`, productIds);
                  methods.setValue(`products-${cat.id}` as any, productIds);
                }
              });
            }, 500); // Increased timeout
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, softwareOptions, methods, softwareLoading]);

  const addCategory = () => {
    const newCategory: CategoryData = {
      id: Date.now().toString(),
      name: "",
      products: [],
    };
    setCategories([...categories, newCategory]);
    // Set default values for the new category
    methods.setValue(`category-${newCategory.id}` as any, "");
    methods.setValue(`products-${newCategory.id}` as any, []);
  };

  const removeCategory = (categoryId: string) => {
    setCategories(categories.filter((cat) => cat.id !== categoryId));
    setSelectedSoftwareIds(prev => {
      const newIds = { ...prev };
      delete newIds[categoryId];
      return newIds;
    });
  };

  // Watch for category and product changes from FormSelect
  useEffect(() => {
    const subscription = methods.watch((value, { name }) => {
      if (name?.startsWith('category-')) {
        const categoryId = name.replace('category-', '');
        const selectedCategoryId = value[name];
        const selectedCategory = softwareOptions.find(cat => cat.value === selectedCategoryId);
        
        // Update selected software ID for this category
        setSelectedSoftwareIds(prev => ({
          ...prev,
          [categoryId]: selectedCategoryId
        }));
        
        setCategories(prevCategories =>
          prevCategories.map((cat) => {
            if (cat.id === categoryId) {
              return {
                ...cat,
                name: selectedCategory ? selectedCategory.label : '',
                products: [], // Reset products when category changes
              };
            }
            return cat;
          })
        );
        // Reset products selection when category changes
        methods.setValue(`products-${categoryId}` as any, []);
      } else if (name?.startsWith('products-')) {
        const categoryId = name.replace('products-', '');
        const selectedProductIds = value[name] || [];
        
        setCategories(prevCategories => {
          return prevCategories.map((cat) => {
            if (cat.id === categoryId) {
              // Get product options for this category
              const productOptions = productOptionsMap[categoryId] || [];
              
              // Map selected IDs to actual product information
              const selectedProducts = selectedProductIds.map((id: string) => {
                const product = productOptions.find(opt => opt.value === id);
                return {
                  id,
                  name: product ? product.label : id, // Use actual product name
                  logo: ''
                };
              });
              
              return {
                ...cat,
                products: selectedProducts
              };
            }
            return cat;
          });
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [methods, productOptionsMap, softwareOptions]);

  const handleProductOptionsChange = (categoryId: string, productOptions: Array<{ value: string; label: string }>) => {
    setProductOptionsMap(prev => ({
      ...prev,
      [categoryId]: productOptions
    }));
  };

  const removeProduct = (categoryId: string, productId: string) => {
    const currentProducts = methods.getValues(`products-${categoryId}` as any) || [];
    const updatedProducts = currentProducts.filter((id: string) => id !== productId);
    methods.setValue(`products-${categoryId}` as any, updatedProducts);
  };

  return (
    <>
      <FormField
        id="heading"
        label="Heading"
        placeholder="Write heading..."
        register={register}
        error={errors?.heading}
      />

      <FormProvider {...methods}>
        <div className="space-y-6">
          {categories.map((category, index) => (
            <CategoryItem
              key={category.id}
              category={category}
              index={index}
              totalCategories={categories.length}
              onRemove={removeCategory}
              softwareOptions={softwareOptions}
              softwareLoading={softwareLoading}
              selectedSoftwareId={selectedSoftwareIds[category.id] || ''}
              selectedSoftwareIds={selectedSoftwareIds}
              error={errors?.categories?.[index]}
              onProductsChange={handleProductOptionsChange}
            />
          ))}

        <Button
          type="button"
          variant="ghost"
          onClick={addCategory}
          className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add More
        </Button>
      </div>
      </FormProvider>

      {errors?.categories && typeof errors.categories === 'object' && errors.categories.message && (
        <p className="text-sm text-red-500 mt-1">{errors.categories.message}</p>
      )}
    </>
  );
};