import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./Providers/ThemeProvider";
import { AuthProvider } from "./Providers/AuthProvider";
import { RouterProvider } from "react-router";
import { router } from "./routes";

// -------------------------------------------------------------------------------------------------
// Create a client with better cache config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes stale time
      refetchOnWindowFocus: false, // Disable refetch on focus for performance
    },
  },
});

// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
