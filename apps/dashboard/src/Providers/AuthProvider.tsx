import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { authClient } from "../api/api";
import type { JWTPayload } from "@task-manager/data";
import React from "react";

// -------------------------------------------------------------------------------------------------
// Helper function
export const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  try {
    const decoded: JWTPayload = jwtDecode(token);
    if (!decoded.exp) return true;
    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// -------------------------------------------------------------------------------------------------
// Define auth store type
interface AuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<void>;
  logout: () => void;
}

// -------------------------------------------------------------------------------------------------
// Define auth store
export const useAuthStore = create<AuthState>()(
  // Using `persist` middleware to persist auth state to localStorage
  persist(
    (set) => ({
      // -------------------------------------------------------------------------------------------
      token: null,
      userId: null,
      isAuthenticated: false,
      // -------------------------------------------------------------------------------------------
      login: async (email, password) => {
        // API: Login
        const { data, error } = await authClient.POST("/auth/login", {
          body: { email, password }, // Fully typed `body`
        });
        if (error) throw error;

        const token = data.access_token; // Fully typed `data`

        // Decode JWT Token to extract payload
        const decoded: JWTPayload = jwtDecode(token);

        // Update store
        set({ token, userId: decoded.sub, isAuthenticated: true });
      },
      // -------------------------------------------------------------------------------------------
      register: async (email, password, displayName) => {
        // API: Register
        const { data, error } = await authClient.POST("/auth/register", {
          body: { email, password, displayName },
        });
        if (error) throw error;

        // API: After register, auto login
        const { data: loginData, error: loginError } = await authClient.POST(
          "/auth/login",
          { body: { email, password } }
        );
        if (loginError) throw loginError;

        const token = loginData.access_token;

        // Decode JWT Token to extract payload
        const decoded: JWTPayload = jwtDecode(token);

        const newState: Partial<AuthState> = {
          token,
          userId: decoded.sub,
          isAuthenticated: true,
        };

        // Update store
        set(newState);
      },
      // -------------------------------------------------------------------------------------------
      logout: () => set({ token: null, userId: null, isAuthenticated: false }),
      // -------------------------------------------------------------------------------------------
    }),
    {
      name: "auth-storage", // Unique name for the item in localStorage
    }
  )
);

// -------------------------------------------------------------------------------------------------
// Define custom auth hook that wraps useAuthStore
// export const useAuth = () => useAuthStore();
export const useAuth = () => {
  const state = useAuthStore();

  if (isTokenExpired(state.token) && state.isAuthenticated) {
    // Token is expired — logout immediately
    state.logout();
    // return unauthenticated state
    return { ...state, token: null, isAuthenticated: false, userId: null };
  }

  return state;
};

// React provider to restore token on mount
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // On first render, rehydrate auth store from local storage.
  // Then check if token is expired.
  React.useEffect(() => {
    useAuthStore.persist.rehydrate()?.then(() => {
      const { token, logout } = useAuthStore.getState();
      if (isTokenExpired(token)) {
        logout();
      }
    });
  }, []);
  return <>{children}</>;
};
