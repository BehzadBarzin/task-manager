import { create } from "zustand";
import { persist } from "zustand/middleware";
import React from "react";

// -------------------------------------------------------------------------------------------------
// Define theme store type
interface ThemeState {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

// -------------------------------------------------------------------------------------------------
// Define theme store
const useThemeStore = create<ThemeState>()(
  // Using `persist` middleware to persist theme state to localStorage
  persist(
    (set) => ({
      // -------------------------------------------------------------------------------------------
      theme: "light",
      // -------------------------------------------------------------------------------------------
      toggleTheme: () => {
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" }));
      },
      // -------------------------------------------------------------------------------------------
    }),
    {
      name: "theme-storage", // Unique name for the item in localStorage
    }
  )
);

// -------------------------------------------------------------------------------------------------
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Retrieve current `theme` from theme store
  const theme = useThemeStore((state) => state.theme);
  // On `theme` value change toggle `dark` class
  React.useEffect(() => {
    useThemeStore.persist.rehydrate();
    document.querySelector("#root")!.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Render children
  return <>{children}</>;
};

export const useTheme = () => useThemeStore();
