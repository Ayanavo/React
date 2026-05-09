import { DefaultChatTransport } from "ai";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

export const apiUrl = import.meta.env.VITE_API_URL;

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const getAuthToken = () => {
  const token = sessionStorage.getItem("auth_token");
  if (!token) return "";

  try {
    return JSON.parse(token);
  } catch {
    return token;
  }
};

export const axiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axiosInstance.post(`${apiUrl}auth/refresh-token`);
        const { token } = response.data;

        // Store new token
        sessionStorage.setItem("auth_token", token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        sessionStorage.removeItem("auth_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const createChatTransport = (apiUrl: string) => {
  const token = getAuthToken();

  return new DefaultChatTransport({
    api: apiUrl + "ai/chat",
    fetch: (url, options = {}) => {
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
      return fetch(url, { ...options, headers });
    },
  });
};
