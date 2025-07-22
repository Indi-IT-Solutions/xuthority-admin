import { useState, useEffect } from 'react';

interface UseMinimumLoadingTimeOptions {
  minDisplayTime?: number; // in milliseconds
  enabled?: boolean;
}

/**
 * Custom hook to ensure loading indicators are visible for a minimum duration
 * This provides better user feedback when components load very quickly
 * 
 * @param isActuallyLoading - The actual loading state from your API/component
 * @param options - Configuration options
 * @returns isLoading - The enhanced loading state that respects minimum display time
 */
export const useMinimumLoadingTime = (
  isActuallyLoading: boolean,
  options: UseMinimumLoadingTimeOptions = {}
) => {
  const { minDisplayTime = 800, enabled = true } = options;
  
  const [isLoading, setIsLoading] = useState(isActuallyLoading);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(isActuallyLoading);
      return;
    }

    if (isActuallyLoading) {
      // Start loading - record the start time
      setIsLoading(true);
      setLoadingStartTime(Date.now());
    } else if (loadingStartTime !== null) {
      // Loading finished - check if minimum time has passed
      const elapsedTime = Date.now() - loadingStartTime;
      
      if (elapsedTime >= minDisplayTime) {
        // Minimum time has passed, hide loader immediately
        setIsLoading(false);
        setLoadingStartTime(null);
      } else {
        // Minimum time hasn't passed, delay hiding the loader
        const remainingTime = minDisplayTime - elapsedTime;
        const timeoutId = setTimeout(() => {
          setIsLoading(false);
          setLoadingStartTime(null);
        }, remainingTime);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [isActuallyLoading, loadingStartTime, minDisplayTime, enabled]);

  return isLoading;
};

export default useMinimumLoadingTime; 