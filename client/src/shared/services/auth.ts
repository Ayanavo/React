import { apiUrl, axiosInstance, createChatTransport } from "@/shared/interceptors/auth-interceptor";
import { disconnectSocket } from "@/shared/services/socket";
import { clearAuthToken, setAuthToken } from "@/shared/utils/auth-token";

export type RegisterPayload = {
  photoURL: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  title?: string;
};

export type VerificationEmailResponse = {
  message: string;
  resendAvailableIn?: number;
  retryAfterSeconds?: number;
  alreadyVerified?: boolean;
  registrationExpiresAt?: string;
};

export type VerificationStatusResponse = {
  isVerified: boolean;
  registrationExpiresAt: string | null;
  canRegister: boolean;
};

export type LoginPayload = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type SaveSettingsPayload = {
  date_format: string;
  currency_format: string;
  font_style: string;
  theme: string;
};

export type ProfileResponse = {
  user: {
    email?: string;
    photoURL?: string;
    firstName: string;
    lastName: string;
    mobile: string;
    address: {
      addressLine1: string;
      addressLine2?: string;
      landmark?: string;
      city: string;
      state: string;
      pincode: string;
    };
    companies?: Array<{
      companyName: string;
      designation: string;
      fromMonth: string;
      fromYear: string;
      toMonth?: string;
      toYear?: string;
      isPresent: boolean;
    }>;
  };
  termsAcceptedAt?: string | null;
  oauthProvider?: string | null;
  requiresTermsAcceptance?: boolean;
};

export const loginAPI = async (payload: LoginPayload) => {
  const response = await axiosInstance.post(apiUrl + "auth/login", payload);
  setAuthToken(response.data.token);
  return response.data;
};

export const sendVerificationEmailAPI = async (email: string) => {
  const response = await axiosInstance.post<VerificationEmailResponse>(apiUrl + "auth/send-verification-email", { email });
  return response.data;
};

export const resendVerificationEmailAPI = async (email: string) => {
  const response = await axiosInstance.post<VerificationEmailResponse>(apiUrl + "auth/resend-verification-email", { email });
  return response.data;
};

export const getVerificationStatusAPI = async (email: string) => {
  const response = await axiosInstance.get<VerificationStatusResponse>(apiUrl + "auth/verification-status", {
    params: { email },
  });
  return response.data;
};

export const registerAPI = async (payload: RegisterPayload) => {
  const response = await axiosInstance.post(apiUrl + "auth/register", payload);
  if (response.data.token) {
    setAuthToken(response.data.token);
  }
  return response.data;
};

export const acceptTermsAPI = async () => {
  const response = await axiosInstance.post(apiUrl + "auth/accept-terms");
  return response.data;
};

export const forgotPasswordAPI = async (email: string) => {
  const response = await axiosInstance.post(apiUrl + "auth/forgot-password", { email });
  return response.data;
};

export const logoutAPI = async () => {
  try {
    const response = await axiosInstance.post(apiUrl + "auth/logout");
    return response.data;
  } finally {
    clearAuthToken();
    disconnectSocket();
  }
};

export const getCurrentUserAPI = async () => {
  const response = await axiosInstance.get<ProfileResponse>(apiUrl + "auth/getUserProfile");
  return response.data;
};

export const saveSettingsAPI = async (payload: SaveSettingsPayload) => {
  const response = await axiosInstance.post(apiUrl + "auth/saveSettings", payload);
  return response.data;
};

export { createChatTransport };
