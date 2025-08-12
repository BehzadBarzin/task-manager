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
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <nav className="flex flex-col p-4">
          {navItems.map(
            (item) =>
              item && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`py-2 ${
                    location.pathname === item.path ? "text-primary" : ""
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
        <header className="flex justify-between p-4 bg-topbar">
          <button
            className="md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
          <div className="flex items-center">
            <button onClick={toggleTheme}>
              {theme === "light" ? <Moon /> : <Sun />}
            </button>
            <button onClick={logout}>
              <LogOut />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
