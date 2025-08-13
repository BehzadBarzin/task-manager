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
type OrgResponseDto = apiTypes.components["schemas"]["OrgResponseDto"];

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
  const { data: org } = useQuery<OrgResponseDto>({
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
      queryClient.invalidateQueries({ queryKey: ["audit", orgId] });
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
    <div className="mx-auto">
      <div className="bg-base-100 rounded-box shadow-xl p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">
          Members for Organization:{" "}
          <span className="kbd">{org?.name || orgId}</span>
        </h1>
        <div className="bg-base-200 rounded-box p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Member</h2>
          <form
            onSubmit={handleSubmit(onAdd)}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1">
              <input
                {...register("userId")}
                placeholder="User ID"
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <select
                {...register("role")}
                className="select select-bordered w-full"
              >
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Adding...
                  </>
                ) : (
                  "Add Member"
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Members</h2>
          {members && members.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-base-300">
              <table className="table">
                <thead className="bg-base-200">
                  <tr>
                    <th>User ID</th>
                    <th>Role</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member: Membership) => (
                    <tr key={member.id} className="hover">
                      <td className="font-mono text-sm" title={member.userId}>
                        {member.userId.substring(0, 8)}...
                      </td>
                      <td>
                        <div className="badge badge-ghost badge-md">
                          {member.role}
                        </div>
                      </td>
                      <td className="text-right">
                        {members.length > 1 || member.role !== "owner" ? (
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => removeMutation.mutate(member.userId)}
                            disabled={removeMutation.isPending}
                          >
                            {removeMutation.isPending ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              "Remove"
                            )}
                          </button>
                        ) : (
                          <div
                            className="tooltip"
                            data-tip="Cannot remove the only owner"
                          >
                            <button className="btn btn-disabled btn-sm">
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-base-200 rounded-lg">
              <p className="text-base-content/70">No members found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Members;
