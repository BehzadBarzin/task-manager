import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { useRole } from "../../hooks/useRole";
import { useApiClient } from "../../api/api.js";
import { apiTypes } from "@task-manager/data";

// -------------------------------------------------------------------------------------------------
type AuditResponseDto = apiTypes.components["schemas"]["AuditResponseDto"];
type OrgResponseDto = apiTypes.components["schemas"]["OrgResponseDto"];

// -------------------------------------------------------------------------------------------------
const AuditLogs: React.FC = () => {
  // -----------------------------------------------------------------------------------------------
  // Use custom hook to get an api client (with token from auth store)
  const apiClient = useApiClient();
  // -----------------------------------------------------------------------------------------------
  const { orgId } = useParams<{ orgId: string }>();
  // -----------------------------------------------------------------------------------------------
  const role = useRole(orgId);
  // -----------------------------------------------------------------------------------------------
  // Get audit logs for organization from API
  const { data: logs, isLoading } = useQuery<AuditResponseDto[]>({
    queryKey: ["audit", orgId],
    queryFn: async () => {
      const { data } = await apiClient.GET("/orgs/{orgId}/audit-logs", {
        params: { path: { orgId: orgId! } },
      });

      if (!data) return [];

      return data;
    },
  });
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
  if (isLoading) return <div>Loading...</div>;
  // -----------------------------------------------------------------------------------------------
  if (role !== "owner" && role !== "admin") return <div>Access Denied</div>;
  // -----------------------------------------------------------------------------------------------
  // -----------------------------------------------------------------------------------------------
  return (
    <div className="mx-auto">
      <div className="bg-base-100 rounded-box shadow-xl p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">
          Audit Logs for Organization:{" "}
          <span className="kbd">{org?.name || orgId}</span>
        </h1>
        {logs && logs.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-base-300">
            <table className="table table-zebra">
              <thead className="bg-base-200">
                <tr>
                  <th className="text-left">Created At</th>
                  <th className="text-left">Id</th>
                  <th className="text-left">Actor Id</th>
                  <th className="text-left">Action</th>
                  <th className="text-left">Target Id</th>
                  <th className="text-left">Meta</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: AuditResponseDto) => (
                  <tr key={log.id} className="hover">
                    <td className="whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="font-mono text-sm" title={log.id}>
                      {log.id.substring(0, 8)}...
                    </td>
                    <td className="font-mono text-sm" title={log.actorId}>
                      {log.actorId.substring(0, 8)}...
                    </td>
                    <td>
                      <span className="badge badge-ghost badge-sm">
                        {log.action}
                      </span>
                    </td>
                    <td className="font-mono text-sm" title={log.targetId}>
                      {log.targetId
                        ? log.targetId.substring(0, 8) + "..."
                        : "-"}
                    </td>
                    <td
                      className="text-xs max-w-xs truncate"
                      title={JSON.stringify(log.meta)}
                    >
                      {log.meta ? JSON.stringify(log.meta) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium">No audit logs found</h3>
            <p className="text-base-content/70 mt-1">
              There are no audit logs for this organization yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
