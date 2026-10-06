import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../service/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ name: "Jason", email: "jason@example.com" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      if (data?.success && data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (err) {
      // If unauthorized or backend not reachable, keep guest/demo user "Jason"
      console.log("Backend auth check: guest or unauthenticated mode", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async ({ email, password }) => {
    try {
      setError(null);
      const data = await loginUser({ email, password });
      if (data?.success && data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, data };
      }
      return { success: false, message: data?.message || "Login failed" };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login error";
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      setError(null);
      const data = await registerUser({ name, email, password });
      if (data?.success && data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, data };
      }
      return { success: false, message: data?.message || "Registration failed" };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Registration error";
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser({ name: "Jason", email: "jason@example.com" });
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
