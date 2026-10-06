import axios from "axios";

export const authApiInstance = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export const loginUser = async ({ email, password }) => {
  const response = await authApiInstance.post("/api/auth/login", { email, password });
  return response.data;
};

export const registerUser = async ({ name, email, password }) => {
  const response = await authApiInstance.post("/api/auth/register", { name, email, password });
  return response.data;
};

export const logoutUser = async () => {
  const response = await authApiInstance.get("/api/auth/logout");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await authApiInstance.get("/api/auth/me");
  return response.data;
};
