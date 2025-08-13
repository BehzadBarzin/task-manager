import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router";
import { useRole } from "../../hooks/useRole";
import { useApiClient } from "../../api/api.js";
import { apiTypes } from "@task-manager/data";
import { useEffect } from "react";

// -------------------------------------------------------------------------------------------------
type PaginatedAuditResponseDto =
  apiTypes.components["schemas"]["PaginatedAuditResponseDto"];
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
  // Pagination & Data:
  // -----------------------------------------------------------------------------------------------
  // To retrieve and modify search params in the URL (best practice to reflect filters and pagination in the URL)
  const [searchParams, setSearchParams] = useSearchParams();
  // -----------------------------------------------------------------------------------------------
  // Page state from URL or default
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  // -----------------------------------------------------------------------------------------------
  // Get paginated audit logs for organization from API
  const { data: paginatedLogs, isLoading } =
    useQuery<PaginatedAuditResponseDto>({
      queryKey: ["audit", orgId, currentPage], // Notice: including page number in cache key to fetch new data when page changes
      queryFn: async () => {
        const { data } = await apiClient.GET("/orgs/{orgId}/audit-logs", {
          params: { path: { orgId: orgId! }, query: { page: currentPage } },
        });

        if (!data || !("data" in data)) {
          throw new Error("Invalid response format");
        }

        return data;
      },
    });

  // -----------------------------------------------------------------------------------------------
  // Sync page to URL search params
  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }

    setSearchParams(params);
  };

  // -----------------------------------------------------------------------------------------------
  const logs = paginatedLogs?.data || [];
  const meta = paginatedLogs?.meta;
  const totalPages = meta?.totalPages || 1;
  // -----------------------------------------------------------------------------------------------
  // Handle invalid page (e.g. page > totalPages)
  useEffect(() => {
    if (meta && currentPage > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta, currentPage, setPage]);
  // -----------------------------------------------------------------------------------------------
  // DaisyUI Pagination Component
  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <li key={i}>
          <button
            className={`mx-1 btn btn-sm ${
              i === currentPage ? "btn-active" : ""
            }`}
            onClick={() => setPage(i)}
            disabled={isLoading}
          >
            {i}
          </button>
        </li>
      );
    }

    return (
      <div className="flex justify-center my-6">
        <ul className="join">
          <li>
            <button
              className="mr-1 btn btn-sm join-item"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              «
            </button>
          </li>
          {pages}
          <li>
            <button
              className="ml-1 btn btn-sm join-item"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              »
            </button>
          </li>
        </ul>
      </div>
    );
  };
  // -----------------------------------------------------------------------------------------------
  // -----------------------------------------------------------------------------------------------
  if (role !== "owner" && role !== "admin") return <div>Access Denied</div>;
  // -----------------------------------------------------------------------------------------------
  if (isLoading) return <div>Loading...</div>;
  // -----------------------------------------------------------------------------------------------
  // -----------------------------------------------------------------------------------------------
  return (
    <div className="mx-auto">
      <div className="bg-base-100 rounded-box shadow-xl p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">
          Audit Logs for Organization:{" "}
          <span className="kbd">{org?.name || orgId}</span>
        </h1>

        {logs.length > 0 ? (
          <>
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
                      <td
                        className="font-mono text-sm"
                        title={log.targetId || ""}
                      >
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

            {/* DaisyUI Pagination */}
            {totalPages > 1 && renderPagination()}

            {/* Info */}
            <div className="text-center text-sm text-base-content/70 mt-2">
              Page {currentPage} of {totalPages} • Total: {meta?.total} logs
            </div>
          </>
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
