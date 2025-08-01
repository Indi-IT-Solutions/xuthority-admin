import { useCallback } from 'react';
import { useToast } from '@/hooks/useToast';

export interface ErrorDetails {
  message: string;
  code?: string | number;
  status?: number;
  type?: 'network' | 'auth' | 'permission' | 'validation' | 'server' | 'unknown';
}

export const useErrorHandler = () => {
  const { error: showErrorToast } = useToast();

  const handleError = useCallback((error: any): ErrorDetails => {
    let errorDetails: ErrorDetails = {
      message: 'An unexpected error occurred',
      type: 'unknown'
    };

    // Handle different types of errors
    if (error?.response) {
      // Axios error with response
      const { status, data } = error.response;
      
      errorDetails.status = status;
      errorDetails.code = status;

      switch (status) {
        case 400:
          errorDetails.type = 'validation';
          errorDetails.message = data?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          errorDetails.type = 'auth';
          errorDetails.message = data?.message || 'Authentication required. Please log in.';
          break;
        case 403:
          errorDetails.type = 'permission';
          errorDetails.message = data?.message || 'Access denied. You don\'t have permission to perform this action.';
          break;
        case 404:
          errorDetails.type = 'unknown';
          errorDetails.message = data?.message || 'Resource not found.';
          break;
        case 500:
          errorDetails.type = 'server';
          errorDetails.message = data?.message || 'Server error. Please try again later.';
          break;
        default:
          errorDetails.type = 'unknown';
          errorDetails.message = data?.message || `Error ${status}: Something went wrong.`;
      }
    } else if (error?.request) {
      // Axios error without response (network error)
      errorDetails.type = 'network';
      errorDetails.message = 'Network error. Please check your connection and try again.';
    } else if (error?.message) {
      // Generic error with message
      errorDetails.message = error.message;
      
      // Try to determine type from message
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorDetails.type = 'network';
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        errorDetails.type = 'permission';
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorDetails.type = 'auth';
      } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        errorDetails.type = 'server';
      }
    }

    return errorDetails;
  }, []);

  const showError = useCallback((error: any) => {
    const errorDetails = handleError(error);
    showErrorToast(errorDetails.message);
    return errorDetails;
  }, [handleError, showErrorToast]);

  const handleApiError = useCallback(async (apiCall: () => Promise<any>) => {
    try {
      return await apiCall();
    } catch (error) {
      const errorDetails = showError(error);
      throw errorDetails;
    }
  }, [showError]);

  return {
    handleError,
    showError,
    handleApiError
  };
}; 