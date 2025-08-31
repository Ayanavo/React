import axios, { AxiosError, AxiosResponse } from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
const axios_auth = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // 30 second timeout
});

const redirectToLogin = (message: string) => {
  console.log(message);
  window.location.href = "React/login";
};

// Add request interceptor for authentication
axios_auth.interceptors.request.use(
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

axios_auth.interceptors.response.use(
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
export const request = <T>({ ...options }): Promise<AxiosResponse<T>> => {
  const onSuccess = (response: AxiosResponse) => response;
  const onError = (error: AxiosError) => {
    console.log("API Error:", error);
    return Promise.reject(error.response || error);
  };

  return axios_auth(options).then(onSuccess, onError);
};
