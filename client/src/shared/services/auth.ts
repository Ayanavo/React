// loginService.ts
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("auth_token");
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
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
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

export const loginAPI = async (email: string, password: string, rememberMe: boolean) => {
  const response = await axiosInstance<{ user: any; message: string; token: string }>({
    method: "POST",
    url: `${apiUrl}auth/login`,
    data: { email, password, rememberMe },
  });

  // Store session token
  sessionStorage.setItem("auth_token", response.data.token);
  return response.data;
};

export const registerAPI = async (email: string, password: string, fname: string, lname: string, title: string) => {
  const response = await axiosInstance.post(apiUrl + "auth/register", {
    email,
    password,
    firstName: fname,
    lastName: lname,
    title,
  });
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
