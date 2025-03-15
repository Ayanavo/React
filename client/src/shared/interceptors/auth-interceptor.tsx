import axios, { AxiosError, AxiosResponse } from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
const axiosInstance = axios.create({ baseURL: apiUrl, withCredentials: true });
const token = sessionStorage.getItem("auth_token");

// Request Interceptor
export const request = <T = any,>({ ...options }): Promise<AxiosResponse<T>> => {
  token && (axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`);
  const onSuccess = (response: AxiosResponse) => response;
  const onError = (error: AxiosError) => Promise.reject(error.response);
  return axiosInstance(options).then(onSuccess, onError);
};

// Response Interceptor
export const response = (response: AxiosResponse) => {
  // Handle successful responses
  return response;
};
