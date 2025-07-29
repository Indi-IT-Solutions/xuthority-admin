import { useState, useEffect, memo, useRef } from "react";
import { FormField } from "./FormField";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormProvider, useForm } from "react-hook-form";
import { useSoftwareOptions } from "@/hooks/useSoftwareOptions";
import { useSolutionOptions } from "@/hooks/useSolutionOptions";
import { useProductsBySoftwareOrSolution } from "@/hooks/useProductsBySoftwareOrSolution";

interface PopularFormProps {
  register: any;
  errors: any;
  setValue?: any;
  watch?: any;
}


interface SolutionData {
  id: string;
  name: string;
  types: Array<{ id: string; name: string }>;
}

interface SolutionItemProps {
  solution: SolutionData;
  index: number;
  totalSolutions: number;
  onRemove: (solutionId: string) => void;
  combinedOptions: Array<{ value: string; label: string }>;
  loading: boolean;
  selectedId: string;
  error?: any;
}

const SolutionItem = memo(({ 
  solution, 
  index, 
  totalSolutions, 
  onRemove, 
  combinedOptions, 
  loading,
  selectedId,
  error 
}: SolutionItemProps) => {
  const hasSelection = !!selectedId;
  const { options: productOptions, isLoading: productsLoading } = useProductsBySoftwareOrSolution(
    selectedId,
    hasSelection
  );

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">Solution {index + 1}</h3>
        {totalSolutions > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(solution.id)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <FormSelect
        name={`solution-${solution.id}`}
        label="Software & Solution"
        placeholder="Select software & solution"
        options={combinedOptions}
        searchable
        disabled={loading}
      />
      {error?.name && (
        <p className="text-sm text-red-500 -mt-3 mb-4">{error.name.message}</p>
      )}

      <FormSelect
        name={`types-${solution.id}`}
        label="Products"
        placeholder={hasSelection ? "Select Products (max. 4)" : "Please select a software & solution first"}
        options={productOptions}
        searchable
        multiple
        maxSelections={4}
        disabled={!hasSelection || productsLoading}
      />
      {error?.types && typeof error.types === 'object' && error.types.message && (
        <p className="text-sm text-red-500 -mt-3 mb-4">{error.types.message}</p>
      )}
    </div>
  );
});

SolutionItem.displayName = 'SolutionItem';

export const PopularForm: React.FC<PopularFormProps> = ({ register, errors, setValue, watch }) => {
  const [solutions, setSolutions] = useState<SolutionData[]>([
    {
      id: "1",
      name: "",
      types: [],
    },
  ]);
  
  const [selectedIds, setSelectedIds] = useState<Record<string, string>>({});
  const dataLoadedRef = useRef(false);
  
  // Fetch software and solution options from API
  const { options: softwareOptions, isLoading: softwareLoading } = useSoftwareOptions();
  const { options: solutionOptions, isLoading: solutionLoading } = useSolutionOptions();
  
  // Combine software and solution options
  const combinedOptions = [...softwareOptions, ...solutionOptions];

  // Create form methods for FormSelect
  const methods = useForm({
    defaultValues: {
      'solution-1': '',
      'types-1': [], // Initial types for first solution
    }
  });

  // Update form value when solutions change
  useEffect(() => {
    if (setValue) {
      setValue("solutions", solutions);
    }
  }, [solutions, setValue]);

  // Reset dataLoadedRef when component mounts or watch changes
  useEffect(() => {
    dataLoadedRef.current = false;
  }, [watch]);

  // Load solutions from parent form when data changes
  useEffect(() => {
    if (watch && combinedOptions.length > 0 && !softwareLoading && !solutionLoading) {
      const watchedSolutions = watch("solutions");
      
      if (watchedSolutions && Array.isArray(watchedSolutions) && watchedSolutions.length > 0 && !dataLoadedRef.current) {
        // Only update if the data is different
        const hasData = watchedSolutions.some(sol => sol.name || (sol.types && sol.types.length > 0));
        if (hasData) {
          dataLoadedRef.current = true;
          setSolutions(watchedSolutions);
          
          // Initialize form fields for each solution after a small delay
          setTimeout(() => {
            watchedSolutions.forEach((sol: SolutionData) => {
              if (sol.name) {
                // Find the option ID from the name
                const option = combinedOptions.find(opt => opt.label === sol.name);
                if (option) {
                  methods.setValue(`solution-${sol.id}` as any, option.value);
                  setSelectedIds(prev => ({ ...prev, [sol.id]: option.value }));
                }
              }
              if (sol.types && sol.types.length > 0) {
                const typeIds = sol.types.map(t => t.id);
                methods.setValue(`types-${sol.id}` as any, typeIds);
              }
            });
          }, 100);
        }
      }
    }
  }, [watch, combinedOptions, methods, softwareLoading, solutionLoading]);

  const addSolution = () => {
    const newSolution: SolutionData = {
      id: Date.now().toString(),
      name: "",
      types: [],
    };
    setSolutions([...solutions, newSolution]);
    // Set default values for the new solution
    methods.setValue(`solution-${newSolution.id}` as any, "");
    methods.setValue(`types-${newSolution.id}` as any, []);
  };

  const removeSolution = (solutionId: string) => {
    setSolutions(solutions.filter((sol) => sol.id !== solutionId));
    setSelectedIds(prev => {
      const newIds = { ...prev };
      delete newIds[solutionId];
      return newIds;
    });
  };

  // Watch for solution and type changes from FormSelect
  useEffect(() => {
    const subscription = methods.watch((value, { name }) => {
      if (name?.startsWith('solution-')) {
        const solutionId = name.replace('solution-', '');
        const selectedId = value[name];
        
        const selectedOption = combinedOptions.find(opt => opt.value === selectedId);
        
        // Update selected ID - we don't need to track type anymore
        setSelectedIds(prev => ({
          ...prev,
          [solutionId]: selectedId
        }));
        
        setSolutions(prevSolutions =>
          prevSolutions.map((sol) => {
            if (sol.id === solutionId) {
              return {
                ...sol,
                name: selectedOption ? selectedOption.label : '',
                types: [], // Reset types when solution changes
              };
            }
            return sol;
          })
        );
        // Reset types selection when solution changes
        methods.setValue(`types-${solutionId}` as any, []);
      } else if (name?.startsWith('types-')) {
        const solutionId = name.replace('types-', '');
        const selectedTypeIds = value[name] || [];
        
        setSolutions(prevSolutions => {
          return prevSolutions.map((sol) => {
            if (sol.id === solutionId) {
              // Store selected product IDs as types
              const selectedTypes = selectedTypeIds.map((id: string) => ({
                id,
                name: id, // This will be the product name from the API
              }));
              
              return {
                ...sol,
                types: selectedTypes
              };
            }
            return sol;
          });
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [methods]);


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
          {solutions.map((solution, index) => (
            <SolutionItem
              key={solution.id}
              solution={solution}
              index={index}
              totalSolutions={solutions.length}
              onRemove={removeSolution}
              combinedOptions={combinedOptions}
              loading={softwareLoading || solutionLoading}
              selectedId={selectedIds[solution.id] || ''}
              error={errors?.solutions?.[index]}
            />
          ))}

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
      </FormProvider>

      {errors?.solutions && typeof errors.solutions === 'object' && errors.solutions.message && (
        <p className="text-sm text-red-500 mt-1">{errors.solutions.message}</p>
      )}
    </>
  );
};