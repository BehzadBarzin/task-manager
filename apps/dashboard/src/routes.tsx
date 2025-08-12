import { createBrowserRouter, Navigate } from "react-router";
import App from "./App";
import { useAuth } from "./Providers/AuthProvider";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Organizations from "./pages/organizations/Organizations";
import Members from "./pages/organizations/Members";
import Tasks from "./pages/tasks/Tasks";
import AuditLogs from "./pages/audit/AuditLogs";
import ErrorPage from "./pages/error";

// -------------------------------------------------------------------------------------------------
// ProtectedRoute as a wrapper: protects routes by redirecting to login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // `useAuth` checks if token is expired, so after expiry the user would be navigated to login page
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// -------------------------------------------------------------------------------------------------
// Define routes
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Organizations />
          </ProtectedRoute>
        ),
      },
      {
        path: "orgs/:orgId/members",
        element: (
          <ProtectedRoute>
            <Members />
          </ProtectedRoute>
        ),
      },
      {
        path: "orgs/:orgId/tasks",
        element: (
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        ),
      },
      {
        path: "orgs/:orgId/audit",
        element: (
          <ProtectedRoute>
            <AuditLogs />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);
