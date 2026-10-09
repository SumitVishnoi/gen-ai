
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { getCurrentUser } from "../service/auth.api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    console.log("1. Authentication check started");

    setLoading(true);

    try {
      console.log("2. Calling getCurrentUser");

      // Prevent an indefinitely pending request from blocking the app.
      const data = await Promise.race([
        getCurrentUser(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Authentication request timed out")),
            10000
          )
        ),
      ]);

      console.log("3. API response:", data);

      if (data?.success && data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        setError(null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Authentication failed:", err);

      setUser(null);
      setIsAuthenticated(false);
      setError(err.message || "Authentication failed");
    } finally {
      console.log("4. Authentication check finished");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        loading,
        setLoading,
        error,
        setError,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};