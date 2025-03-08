// loginService.ts
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export const loginAPI = async (email: string, password: string) => {
  const response = await axios.post<{ user: any; message: string }>(apiUrl + "auth/login", { email, password });
  return response.data;
};

export const registerAPI = async (email: string, password: string, fname: string, lname: string, title: string) => {
  const response = await axios.post(apiUrl + "auth/register", { email, password, ...{ firstName: fname }, ...{ lastName: lname }, title });
  return response.data;
};
