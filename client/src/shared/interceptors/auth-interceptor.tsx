import showToast from "@/hooks/toast";
import { DefaultChatTransport } from "ai";
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useNavigate } from "react-router";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const apiUrl = import.meta.env.VITE_API_URL;
export const API_TIMEOUT_MS = 30_000;
export const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
  timeout: API_TIMEOUT_MS,
});
export const navigate = useNavigate();

const redirectToLogin = (message: string) => {
  console.log(message);
  showToast({
    title: "Session expired or invalid. Redirecting to login...",
    variant: "error",
  });
  sessionStorage.clear();
  navigate("/React");
};

const showForbiddenError = () => {
  showToast({
    title: "Forbidden",
    description: "You do not have permission to perform this action.",
    variant: "error",
  });
};

const showServerError = () => {
  showToast({
    title: "Server error",
    description: "Something went wrong on the server. Please try again.",
    variant: "error",
  });
};

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const authToken = sessionStorage.getItem("auth_token");
    authToken && config && (config.headers.Authorization = `Bearer ${JSON.parse(authToken)}`);
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
          showForbiddenError();
          break;
        case 500:
          showServerError();
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

//Request Interceptor
export const request = ({ ...options }): Promise<AxiosResponse> => {
  const onSuccess = (response: AxiosResponse) => response;
  const onError = (error: AxiosError) => {
    console.log("API Error:", error);
    switch (error.response?.status) {
      case 401:
        redirectToLogin(error.message);
        break;
      case 403:
        showForbiddenError();
        break;
      case 500:
        showServerError();
        break;
      default:
        console.log("API Error:", error.message);
        break;
    }
    return Promise.reject(error.response || error);
  };

  return axiosInstance(options).then(onSuccess, onError);
};

// Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const status = error.response?.status;

    // If error is 401 and we haven't tried to refresh token yet
    if (status === 401 && originalRequest && !originalRequest._retry) {
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
        redirectToLogin("Unauthorized access - 401");
        return Promise.reject(refreshError);
      }
    }

    if (status === 403) {
      showToast({
        title: "Forbidden",
        description: "You do not have permission to perform this action.",
        variant: "error",
      });
    }

    if (status === 500) {
      showToast({
        title: "Server error",
        description: "Something went wrong on the server. Please try again.",
        variant: "error",
      });
    }

    return Promise.reject(error);
  }
);

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
