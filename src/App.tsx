import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import useAdminStore from "@/store/useAdminStore";
import AppRoutes from "@/routes";
import { queryClient } from "@/lib/queryClient";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import GlobalErrorHandler from "@/components/common/GlobalErrorHandler";

function App() {
  const { initializeAuth } = useAdminStore();

  useEffect(() => {
    // Initialize admin authentication on app start
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GlobalErrorHandler>
          <RouterProvider router={AppRoutes} />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <ReactQueryDevtools initialIsOpen={false} />
        </GlobalErrorHandler>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App; 