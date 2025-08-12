import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import type { apiTypes } from "@task-manager/data";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRole } from "../../hooks/useRole";
import { useApiClient } from "../../api/api";

// -------------------------------------------------------------------------------------------------
type Membership = apiTypes.components["schemas"]["MembershipResponseDto"];
type AddMemberDto = apiTypes.components["schemas"]["AddMemberDto"];
type CreateOrgResponseDto =
  apiTypes.components["schemas"]["CreateOrgResponseDto"];

// -------------------------------------------------------------------------------------------------
const addSchema = z.object({
  userId: z.string(),
  role: z.enum(["owner", "admin", "viewer"]),
});

// -------------------------------------------------------------------------------------------------
const Members: React.FC = () => {
  // -----------------------------------------------------------------------------------------------
  // Use custom hook to get an api client (with token from auth store)
  const apiClient = useApiClient();
  // -----------------------------------------------------------------------------------------------
  const { orgId } = useParams<{ orgId: string }>();
  // -----------------------------------------------------------------------------------------------
  const role = useRole(orgId);
  // -----------------------------------------------------------------------------------------------
  // Get query client to invalidate queries
  const queryClient = useQueryClient();
  // -----------------------------------------------------------------------------------------------
  // Get organization details from API
  const { data: org } = useQuery<CreateOrgResponseDto>({
    queryKey: ["orgs", orgId],
    queryFn: async () => {
      const { data } = await apiClient.GET("/orgs/{orgId}", {
        params: { path: { orgId: orgId! } },
      });
      if (!data) {
        throw new Error("Organization not found");
      }

      return data;
    },
  });

  // -----------------------------------------------------------------------------------------------
  // Get organization members from API
  const { data: members, isLoading } = useQuery<Membership[]>({
    queryKey: ["members", orgId],
    queryFn: async () => {
      const { data } = await apiClient.GET("/orgs/{orgId}/members", {
        params: { path: { orgId: orgId! } },
      });
      if (!data) return [];

      return data;
    },
  });

  // -----------------------------------------------------------------------------------------------
  // Add member to organization using API
  const addMutation = useMutation({
    mutationFn: async (body: AddMemberDto) => {
      const { data } = await apiClient.POST("/orgs/{orgId}/members", {
        params: { path: { orgId: orgId! } },
        body,
      });
      return data;
    },
    // Invalidate members query to update UI with new member
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", orgId] });
    },
  });

  // -----------------------------------------------------------------------------------------------
  // Remove member from organization using API
  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await apiClient.DELETE(
        "/orgs/{orgId}/members/{userId}",
        {
          params: { path: { orgId: orgId!, userId } },
        }
      );

      return data;
    },
    // Invalidate members query to update UI with removed member
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", orgId] });
    },
  });

  // -----------------------------------------------------------------------------------------------
  // Form Hook
  const { register, handleSubmit } = useForm<AddMemberDto>({
    resolver: zodResolver(addSchema),
  });
  // Handle form submit
  const onAdd = (data: AddMemberDto) => {
    addMutation.mutate(data);
  };

  // -----------------------------------------------------------------------------------------------
  if (isLoading) return <div>Loading...</div>;
  // -----------------------------------------------------------------------------------------------
  // Only owners of the organization and admins can view this page
  if (role !== "owner" && role !== "admin") return <div>Access Denied</div>;
  // -----------------------------------------------------------------------------------------------
  // -----------------------------------------------------------------------------------------------
  return (
    <div>
      <h1>Members for Organization: {org?.name || orgId}</h1>
      <ul>
        {members?.map((member: Membership) => (
          <li key={member.id}>
            User: {member.userId} Role: {member.role}
            {/* If org only has one owner, do not allow removal */}
            {members.length > 1 && (
              <button onClick={() => removeMutation.mutate(member.userId)}>
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit(onAdd)}>
        <input {...register("userId")} placeholder="User ID" />
        <select {...register("role")}>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
        </select>
        <button type="submit">Add Member</button>
      </form>
    </div>
  );
};

export default Members;
