import { Outlet } from "react-router";
import DashboardLayout from "./layouts/DashboardLayout";
import { useAuth } from "./Providers/AuthProvider";

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ) : (
    <Outlet />
  );
};

export default App;
