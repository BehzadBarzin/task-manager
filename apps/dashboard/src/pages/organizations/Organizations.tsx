import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { apiTypes } from "@task-manager/data";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApiClient } from "../../api/api";

// -------------------------------------------------------------------------------------------------
type Org = apiTypes.components["schemas"]["CreateOrgResponseDto"];
type CreateOrgDto = apiTypes.components["schemas"]["CreateOrgDto"];

// -------------------------------------------------------------------------------------------------
const createSchema = z.object({
  name: z.string().min(1),
});

// -------------------------------------------------------------------------------------------------
const Organizations: React.FC = () => {
  // -----------------------------------------------------------------------------------------------
  // Get query client to invalidate queries
  const queryClient = useQueryClient();
  // -----------------------------------------------------------------------------------------------
  // Use custom hook to get an api client (with token from auth store)
  const apiClient = useApiClient();
  // -----------------------------------------------------------------------------------------------
  // Get a list of organizations for the current user
  const { data: orgs, isLoading } = useQuery<Org[]>({
    queryKey: ["orgs"],
    queryFn: async () => {
      const { data } = await apiClient.GET("/orgs");
      if (!data) return [];

      return data;
    },
  });

  // -----------------------------------------------------------------------------------------------
  // Create a new organization for the current user using the API
  const mutation = useMutation({
    mutationFn: async (body: CreateOrgDto) => {
      const { data } = await apiClient.POST("/orgs", { body }); // Sets current user as owner

      return data;
    },
    // Invalidate the `orgs` query when a new org is created
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
    },
  });

  // -----------------------------------------------------------------------------------------------
  // Form Hook
  const { register, handleSubmit } = useForm<{ name: string }>({
    resolver: zodResolver(createSchema),
  });

  // Handle form submit
  const onSubmit = (data: { name: string }) => mutation.mutate(data);
  // -----------------------------------------------------------------------------------------------
  if (isLoading) return <div>Loading...</div>;
  // -----------------------------------------------------------------------------------------------
  // -----------------------------------------------------------------------------------------------
  return (
    <div className="mx-auto">
      <div className="bg-base-100 rounded-box shadow-xl p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">Organizations</h1>

        <div className="bg-base-200 rounded-box p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Create New Organization
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1">
              <input
                {...register("name")}
                placeholder="Organization Name"
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Creating...
                  </>
                ) : (
                  "Create Organization"
                )}
              </button>
            </div>
          </form>
        </div>

        {orgs && orgs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {orgs.map((org: Org) => (
              <div
                key={org.id}
                className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="card-body">
                  <h2 className="card-title">{org.name}</h2>
                  <div className="card-actions justify-end mt-4">
                    <Link
                      to={`/orgs/${org.id}/tasks`}
                      className="btn btn-primary btn-sm"
                    >
                      Tasks
                    </Link>
                    <Link
                      to={`/orgs/${org.id}/members`}
                      className="btn btn-secondary btn-sm"
                    >
                      Members
                    </Link>
                    <Link
                      to={`/orgs/${org.id}/audit`}
                      className="btn btn-accent btn-sm"
                    >
                      Audit Logs
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 mb-8">
            <div className="bg-base-200 border-base-300 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-8 h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium">No organizations</h3>
            <p className="text-base-content/70 mt-1">
              Get started by creating a new organization.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Organizations;
