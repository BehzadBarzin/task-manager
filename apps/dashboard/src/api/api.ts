import createClient from "openapi-fetch";
import type { authTypes, apiTypes } from "@task-manager/data";
import { useAuth } from "../Providers/AuthProvider";
import React from "react";

// Note: We're not using generated clients from libs/data because we need to pass in token and dynamic base URL

// -------------------------------------------------------------------------------------------------
// Custom hook to create API client (memoized and re-instantiated when token changes in auth store)
export const useApiClient = () => {
  const { token } = useAuth();
  return React.useMemo(
    () =>
      createClient<apiTypes.paths>({
        baseUrl: import.meta.env.VITE_API_SRV_BASE_URL,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }),
    [token]
  );
};

// -------------------------------------------------------------------------------------------------
// Auth service API client
export const authClient = createClient<authTypes.paths>({
  baseUrl: import.meta.env.VITE_AUTH_SRV_BASE_URL,
});
