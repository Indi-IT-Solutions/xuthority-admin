import React, { useEffect } from 'react';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({ children }) => {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Log the error for debugging
      console.group('Unhandled Promise Rejection');
      console.error('Reason:', event.reason);
      console.error('Stack:', event.reason?.stack);
      console.groupEnd();
      
      // Prevent the default browser behavior
      event.preventDefault();
    };

    // Handle unhandled errors
    const handleUnhandledError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      
      // Log the error for debugging
      console.group('Unhandled Error');
      console.error('Error:', event.error);
      console.error('Message:', event.message);
      console.error('Filename:', event.filename);
      console.error('Lineno:', event.lineno);
      console.error('Colno:', event.colno);
      console.groupEnd();
      
      // Prevent the default browser behavior
      event.preventDefault();
    };

    // Handle network errors
    const handleOffline = () => {
      console.warn('Network: You are offline. Please check your internet connection.');
      // You can add a visual indicator here if needed
    };

    const handleOnline = () => {
      console.log('Network: Connection restored.');
      // You can add a visual indicator here if needed
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Cleanup function
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return <>{children}</>;
};

export default GlobalErrorHandler; 