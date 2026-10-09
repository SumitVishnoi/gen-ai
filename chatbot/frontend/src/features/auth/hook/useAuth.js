
import { useContext } from "react";

import { AuthContext } from "../context/AuthContext";

import {
  loginUser,
  logoutUser,
  registerUser,
} from "../service/auth.api";

const useAuth = () => {
  const {
    user,
    loading,
    setUser,
    setIsAuthenticated,
    setError,
  } = useContext(AuthContext);

  // Register user
  const handleRegister = async ({ name, email, password }) => {
    try {
      setError(null);

      const data = await registerUser({ name, email, password });

      if (data?.success && data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);

        return { success: true, data };
      }

      const message = data?.message || "Registration failed";
      setError(message);

      return { success: false, message };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Registration error";

      setError(message);

      return { success: false, message };
    }
  };

  // Login user
  const handleLogin = async ({ email, password }) => {
    try {
      setError(null);

      const data = await loginUser({ email, password });

      if (data?.success && data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);

        return { success: true, data };
      }

      const message = data?.message || "Login failed";
      setError(message);

      return { success: false, message };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login error";

      setError(message);

      return { success: false, message };
    }
  };

  // Logout user
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(
        "Logout error:",
        err.response?.data?.message || err.message
      );
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };


  return {
    user,
    loading,
    handleRegister,
    handleLogin,
    handleLogout,
  };
};

export default useAuth;