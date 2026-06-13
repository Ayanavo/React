import showToast from "@/hooks/toast";
import { DefaultChatTransport } from "ai";
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { disconnectSocket } from "@/shared/services/socket";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/shared/utils/auth-token";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const apiUrl = import.meta.env.VITE_API_URL;
export const API_TIMEOUT_MS = 30_000;
export const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
});

const redirectToLogin = async (message: string) => {
  console.log(message);

  disconnectSocket();

  try {
    await axios.post(`${apiUrl}auth/logout`, {}, { withCredentials: true });
  } catch {
    // Best-effort server logout when session expires
  }

  clearAuthToken();

  showToast({
    title: "Session expired or invalid. Redirecting to login...",
    variant: "error",
  });

  window.location.hash = "#/login";
};

const showError = (message: string) => {
  showToast({
    title: "Forbidden",
    description: message,
    variant: "error",
  });
};

// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    const authToken = getAuthToken();

    if (authToken && config.headers) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// REFRESH TOKEN LOGIC
const callRefreshToken = async (originalRequest: RetriableRequestConfig) => {
  try {
    const response = await axios.post(`${apiUrl}auth/refresh-token`, {}, { withCredentials: true });

    const { token } = response.data;

    setAuthToken(token);

    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${token}`;
    }

    return axiosInstance(originalRequest);
  } catch (refreshError) {
    redirectToLogin("Refresh token expired");
    return Promise.reject(refreshError);
  }
};

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig;
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            return callRefreshToken(originalRequest);
          }

          redirectToLogin("Unauthorized access");
          break;

        case 403:
          showError("You do not have permission to perform this action.");
          break;

        case 500:
          showError("Internal Server Error. Please try again.");
          break;
      }
    } else {
      console.log("Network/server error:", error.message);
    }

    return Promise.reject(error);
  }
);

export const createChatTransport = (apiUrl: string) => {
  const authToken = getAuthToken();

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

//get axios error message from an unknown error type
export const getAxiosErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string })?.message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};
