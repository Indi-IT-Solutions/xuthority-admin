import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import useAdminStore from "@/store/useAdminStore";
import AppRoutes from "@/routes";
import { queryClient } from "@/lib/queryClient";

function App() {
  const { initializeAuth } = useAdminStore();

  useEffect(() => {
    // Initialize admin authentication on app start
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={AppRoutes} />
      <Toaster 
   
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App; 