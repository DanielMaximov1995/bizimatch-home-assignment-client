"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser } from "@/lib/api";
import { LayoutProps } from "@/lib/types";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = (props: LayoutProps) => {
  const { children } = props;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    if (response.success && response.data) {
      setUser(response.data.user);
      router.push("/");
      return { success: true };
    }
    return { success: false, error: response.error };
  };

  const register = async (email: string, password: string) => {
    const response = await apiRegister(email, password);
    if (response.success) {
      return await login(email, password);
    }
    return { success: false, error: response.error };
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    toast.success("התנתקת בהצלחה");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

