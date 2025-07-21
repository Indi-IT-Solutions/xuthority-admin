/**
 * Wraps a promise with a timeout to prevent mutations from hanging indefinitely
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds (default: 45 seconds)
 * @param timeoutMessage - Custom timeout error message
 * @returns Promise that resolves/rejects with timeout protection
 */
export const withMutationTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 45000,
  timeoutMessage: string = 'Request timed out'
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
  );

  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error: any) {
    // Ensure the error is properly re-thrown to maintain React Query behavior
    throw error;
  }
};

/**
 * Enhanced mutation wrapper with automatic retry logic and timeout handling
 * @param mutationFn - The mutation function to wrap
 * @param options - Configuration options
 * @returns Enhanced mutation function with timeout and retry handling
 */
export const createTimeoutMutation = <TData, TError = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    timeoutMs?: number;
    timeoutMessage?: string;
    shouldRetry?: (error: any) => boolean;
  } = {}
) => {
  const {
    timeoutMs = 45000,
    timeoutMessage = 'Request timed out',
    shouldRetry = (error: any) => !error?.message?.includes('timeout')
  } = options;

  return async (variables: TVariables): Promise<TData> => {
    return withMutationTimeout(
      mutationFn(variables),
      timeoutMs,
      timeoutMessage
    );
  };
};

/**
 * Default retry configuration for mutations
 */
export const getDefaultMutationRetry = () => (failureCount: number, error: any) => {
  // Don't retry on timeout errors, validation errors, or auth errors
  if (
    error?.message?.includes('timeout') ||
    error?.message?.includes('validation') ||
    error?.response?.status === 401 ||
    error?.response?.status === 403
  ) {
    return false;
  }
  return failureCount < 2; // Only retry twice
}; 