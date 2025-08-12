import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import AppLayout from "./layouts/app-layout";
import HomePage from "./pages/home";
import DashboardPage from "./pages/dashboard";
import ErrorPage from "./pages/error";

// Create route configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />, // Layout component (with sidebar + outlet)
    errorElement: <ErrorPage />, // Optional global error UI
    children: [
      {
        index: true, // same as path: ""
        element: <HomePage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
    ],
  },
]);

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
