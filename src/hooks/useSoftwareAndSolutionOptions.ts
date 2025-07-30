import { useQuery } from '@tanstack/react-query';
import { SoftwareService } from '@/services/softwareService';
import { SolutionService } from '@/services/solutionService';
import { useMemo } from 'react';

interface CombinedOption {
  value: string;
  label: string;
  type: 'software' | 'solution';
}

export const useSoftwareAndSolutionOptions = (enabled: boolean = true) => {
  // Fetch software options
  const { 
    data: softwareData, 
    isLoading: softwareLoading, 
    error: softwareError 
  } = useQuery({
    queryKey: ['softwares', 'active', 100],
    queryFn: () => SoftwareService.getActiveSoftwares({ page: 1, limit: 100 }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch solution options
  const { 
    data: solutionData, 
    isLoading: solutionLoading, 
    error: solutionError 
  } = useQuery({
    queryKey: ['solutions', 'active', 100],
    queryFn: () => SolutionService.getActiveSolutions({ page: 1, limit: 100 }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Combine both lists into a single options array
  const options = useMemo(() => {
    const combinedOptions: CombinedOption[] = [];

    // Add software options
    if (softwareData?.data) {
      softwareData.data.forEach((software) => {
        combinedOptions.push({
          value: `software_${software._id}`,
          label: `${software.name} (Software)`,
          type: 'software'
        });
      });
    }

    // Add solution options
    if (solutionData?.data) {
      solutionData.data.forEach((solution) => {
        combinedOptions.push({
          value: `solution_${solution._id}`,
          label: `${solution.name} (Solution)`,
          type: 'solution'
        });
      });
    }

    // Sort alphabetically by label
    return combinedOptions.sort((a, b) => a.label.localeCompare(b.label));
  }, [softwareData, solutionData]);

  return {
    options,
    isLoading: softwareLoading || solutionLoading,
    error: softwareError || solutionError
  };
};