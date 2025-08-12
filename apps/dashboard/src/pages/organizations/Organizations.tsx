import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { apiTypes } from "@task-manager/data";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../Providers/AuthProvider";
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
    <div>
      <h1>Organizations</h1>
      <ul>
        {orgs?.map((org: Org) => (
          <li key={org.id}>
            {org.name} <Link to={`/orgs/${org.id}/tasks`}>Tasks</Link>{" "}
            <Link to={`/orgs/${org.id}/members`}>Members</Link>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("name")} placeholder="Org Name" />
        <button type="submit">Create Org</button>
      </form>
    </div>
  );
};

export default Organizations;
