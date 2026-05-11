import showToast from "@/hooks/toast";
import { DefaultChatTransport } from "ai";
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const apiUrl = import.meta.env.VITE_API_URL;
export const API_TIMEOUT_MS = 30_000;
export const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
  timeout: API_TIMEOUT_MS,
  withCredentials: true, // Important for sending cookies with requests
});
const redirectToLogin = (message: string) => {
  console.log(message);
  showToast({
    title: "Session expired or invalid. Redirecting to login...",
    variant: "error",
  });
  window.location.hash = "#/";
};

const showError = (message: string) => {
  showToast({
    title: "Forbidden",
    description: message,
    variant: "error",
  });
};

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const authToken = sessionStorage.getItem("auth_token");
    authToken && config && (config.headers.Authorization = `Bearer ${authToken}`);
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    console.warn("Response Interceptor Error:", error);

    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          redirectToLogin("Unauthorized access - 401");
          break;
        case 403:
          showError("You do not have permission to perform this action.");
          break;
        case 500:
          showError("Internal Server Error. Please try again later.");
          callRefreshToken(error.config as RetriableRequestConfig);
          break;
        default:
          // Handle other status codes if needed
          break;
      }
    } else {
      console.log("Network or server error:", error.message);
    }

    return Promise.reject(error);
  }
);

const callRefreshToken = async (originalRequest: RetriableRequestConfig) => {
  try {
    const response = await axiosInstance.post(`${apiUrl}auth/refresh-token`);
    const { token } = response.data;
    sessionStorage.setItem("auth_token", token);
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return axiosInstance(originalRequest);
  } catch (refreshError) {
    redirectToLogin("Unauthorized access - 401");
    return Promise.reject(refreshError);
  }
};

export const createChatTransport = (apiUrl: string) => {
  const authToken = sessionStorage.getItem("auth_token");

  return new DefaultChatTransport({
    api: apiUrl + "ai/chat",
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

      options.signal?.addEventListener("abort", () => controller.abort(), { once: true });

      const headers = {
        ...options.headers,
        Authorization: `Bearer ${authToken}`,
      };
      return fetch(url, { ...options, headers, signal: controller.signal }).finally(() => {
        window.clearTimeout(timeoutId);
      });
    },
  });
};
