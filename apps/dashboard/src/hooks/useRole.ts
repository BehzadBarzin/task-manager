import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../Providers/AuthProvider";
import type { apiTypes } from "@task-manager/data";
import { useApiClient } from "../api/api";

// -------------------------------------------------------------------------------------------------
type Membership = apiTypes.components["schemas"]["MembershipResponseDto"];
type Role = Membership["role"];

// -------------------------------------------------------------------------------------------------
/**
 * Custom hook to get the role of the current user in the given organization
 *
 * @param orgId organization id
 * @returns the role of the current user in the organization
 */
export const useRole = (orgId: string | undefined): Role => {
  // -----------------------------------------------------------------------------------------------
  // Get auth data from store
  const { userId } = useAuth();
  // -----------------------------------------------------------------------------------------------
  // Use custom hook to get an api client (with token from auth store)
  const apiClient = useApiClient();
  // -----------------------------------------------------------------------------------------------
  // Get organization members from API using React Query
  const { data: memberships } = useQuery<Membership[]>({
    queryKey: ["members", orgId],
    enabled: !!orgId, // Only run query if orgId is defined
    queryFn: async () => {
      if (!orgId) {
        // This is unexpected if `enabled` works correctly, but good for type safety
        throw new Error("Query function called with undefined orgId");
      }

      const { data } = await apiClient.GET("/orgs/{orgId}/members", {
        params: { path: { orgId: orgId } },
      });
      if (!data) return [];

      return data;
    },
  });

  // -----------------------------------------------------------------------------------------------
  // Filter memberships by current user and return role (default to `viewer` if not found)
  return (
    memberships?.find((m: Membership) => m.userId === userId)?.role || "viewer"
  );
  // -----------------------------------------------------------------------------------------------
};
