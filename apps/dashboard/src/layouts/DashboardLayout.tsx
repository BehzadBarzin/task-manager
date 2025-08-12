import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../Providers/AuthProvider";
import { useTheme } from "../Providers/ThemeProvider";
import { LogOut, Sun, Moon, Menu, X } from "lucide-react";
import { useParams } from "react-router";
import { useRole } from "../hooks/useRole";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // -----------------------------------------------------------------------------------------------
  // Get logout function from auth store
  const { logout } = useAuth();
  // -----------------------------------------------------------------------------------------------
  // Get current theme and toggle theme function from theme store
  const { theme, toggleTheme } = useTheme();
  // -----------------------------------------------------------------------------------------------
  // State: is sidebar open?
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // -----------------------------------------------------------------------------------------------
  // Get current location
  const location = useLocation();
  // -----------------------------------------------------------------------------------------------
  // Get orgId from params (/orgs/:orgId/**), might be undefined (this layout is used for non-org-specific routes as well)
  const { orgId } = useParams<{ orgId: string }>();
  // -----------------------------------------------------------------------------------------------
  // Get current user's role in the organization
  const role = useRole(orgId);
  // -----------------------------------------------------------------------------------------------
  // Navigation Items
  const navItems = [
    // ------------------------------------------------------------
    { path: "/", label: "Organizations" },
    // ------------------------------------------------------------
    // Only if in an organization sub-page (/orgs/:orgId/**):
    orgId && { path: `/orgs/${orgId}/tasks`, label: "Tasks" },
    // ------------------------------------------------------------
    // Only if in an organization sub-page (/orgs/:orgId/**) + user is an admin or owner:
    orgId &&
      (role === "owner" || role === "admin") && {
        path: `/orgs/${orgId}/members`,
        label: "Members",
      },
    // ------------------------------------------------------------
    orgId &&
      (role === "owner" || role === "admin") && {
        path: `/orgs/${orgId}/audit`,
        label: "Audit Logs",
      },
    // ------------------------------------------------------------
  ].filter(Boolean); // remove undefined items
  // -----------------------------------------------------------------------------------------------
  // -----------------------------------------------------------------------------------------------
  return (
    <div className="flex h-screen bg-base-200 text-base-content">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-base-100 transform ${
          isSidebarOpen
            ? "translate-x-0 shadow-xl"
            : "-translate-x-full shadow-none"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4 border-b border-base-300">
          <h1 className="text-xl font-bold">Task Manager</h1>
        </div>
        <nav className="flex flex-col p-4 gap-2">
          {navItems.map(
            (item) =>
              item && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`btn btn-ghost justify-start ${
                    location.pathname === item.path ? "btn-active" : ""
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {item.label}
                </Link>
              )
          )}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Topbar */}
        <header className="flex justify-end items-center p-4 bg-base-100 shadow-sm">
          <button
            className="btn btn-square btn-ghost"
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button
            className="btn btn-square btn-ghost"
            onClick={logout}
            title="Logout"
          >
            <LogOut size={20} />
          </button>

          <button
            className="md:hidden btn btn-square btn-ghost"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
