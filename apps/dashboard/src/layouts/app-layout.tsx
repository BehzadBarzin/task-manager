import { Link, Outlet } from "react-router";

export default function AppLayout() {
  return (
    <div className="flex flex-row">
      <div className="w-1/4 p-12 border-r-slate-950 border-r-4">
        <ul>
          <li>
            <Link to="/">🔗Home</Link>
          </li>
          <li>
            <Link to="/dashboard">🔗Dashboard</Link>
          </li>
        </ul>
      </div>
      <div className="p-6">
        {/* Nested routes render here */}
        <Outlet />
      </div>
    </div>
  );
}
