import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../service/auth.api";

const useAuth = () => {
  const { setUser, setIsAuthenticated, setError, setLoading} = useContext(AuthContext);

  const handleRegister = async ({ name, email, password }) => {
    try {
      setError(null);
      const data = await registerUser({ name, email, password });
      if (data?.success && data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, data };
      }
      return {
        success: false,
        message: data?.message || "Registration failed",
      };
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Registration error";
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const handleLogin = async ({ email, password }) => {
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

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      if (data?.success && data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.log(
        "Backend auth check: guest or unauthenticated mode",
        err?.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    handleRegister,
    handleLogin,
    handleLogout,
    checkAuth
  };
};

export default useAuth;
