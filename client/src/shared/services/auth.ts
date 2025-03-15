// loginService.ts
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export const loginAPI = async (email: string, password: string, rememberMe: boolean) => {
  const response = await axios.post<{ user: any; message: string; token: string }>(apiUrl + "auth/login", { email, password, rememberMe }, { withCredentials: true });
  return response.data;
};

export const registerAPI = async (email: string, password: string, fname: string, lname: string, title: string) => {
  const response = await axios.post(apiUrl + "auth/register", { email, password, ...{ firstName: fname }, ...{ lastName: lname }, title });
  return response.data;
};

export const forgotPasswordAPI = async (email: string) => {
  const response = await axios.post(apiUrl + "auth/forgot-password", { email });
  return response.data;
};

export const logoutAPI = async () => {
  const response = await axios.post<{ message: string }>(apiUrl + "auth/logout", { token: sessionStorage.getItem("auth_token") });
  return response.data;
};
