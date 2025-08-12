import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { useRole } from "../../hooks/useRole";
import { useApiClient } from "../../api/api.js";
import { apiTypes } from "@task-manager/data";

// -------------------------------------------------------------------------------------------------
interface AuditLog {
  id: string;
  orgId: string;
  actorId: string;
  action: string;
  targetId?: string;
  meta?: any;
  createdAt: Date;
}

type CreateOrgResponseDto =
  apiTypes.components["schemas"]["CreateOrgResponseDto"];

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
  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ["audit", orgId],
    queryFn: async () => {
      const { data } = await apiClient.GET("/audit-logs", {
        params: { query: { orgId: orgId! } },
      });

      if (!data) return [];

      return data;
    },
  });
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
  if (isLoading) return <div>Loading...</div>;
  // -----------------------------------------------------------------------------------------------
  if (role !== "owner" && role !== "admin") return <div>Access Denied</div>;
  // -----------------------------------------------------------------------------------------------
  // -----------------------------------------------------------------------------------------------
  return (
    <div>
      <h1>Audit Logs for Organization: {org?.name || orgId}</h1>
      <table>
        <thead>
          <tr>
            <th>Created At</th>
            <th>Id</th>
            <th>Actor Id</th>
            <th>Action</th>
            <th>Target Id</th>
            <th>Meta</th>
          </tr>
        </thead>
        <tbody>
          {logs?.map((log: AuditLog) => (
            <tr key={log.id}>
              <td>{new Date(log.createdAt).toUTCString()}</td>
              <td>{log.id}</td>
              <td>{log.actorId}</td>
              <td>{log.action}</td>
              <td>{log.targetId}</td>
              <td>{JSON.stringify(log.meta)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogs;
