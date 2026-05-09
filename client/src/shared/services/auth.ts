// loginService.ts
import { apiUrl, axiosInstance, createChatTransport } from "@/shared/services/api-header";

export type RegisterPayload = {
  photoURL: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  title: string;
};

export type LoginPayload = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export const loginAPI = async (payload: LoginPayload) => {
  const response = await axiosInstance.post(apiUrl + "auth/login", payload);
  sessionStorage.setItem("auth_token", response.data.token);
  return response.data;
};

export const registerAPI = async (payload: RegisterPayload) => {
  const response = await axiosInstance.post(apiUrl + "auth/register", payload);
  return response.data;
};

export const forgotPasswordAPI = async (email: string) => {
  const response = await axiosInstance.post(apiUrl + "auth/forgot-password", { email });
  return response.data;
};

export const logoutAPI = async () => {
  const response = await axiosInstance.post(apiUrl + "auth/logout");
  sessionStorage.removeItem("auth_token");
  return response.data;
};

export const getCurrentUserAPI = async () => {
  const response = await axiosInstance.get<{ user: any }>(apiUrl + "auth/getUserProfile");
  return response.data.user;
};

export const verifyAuthAPI = async (token: string) => {
  const response = await axiosInstance.get(apiUrl + "auth/verifyToken", {
    params: { access: token },
  });
  return response.data;
};

export { createChatTransport };
