import type { CVElement, PageProperties } from "@/lib/useCV";
import { apiUrl, axiosInstance } from "@/shared/interceptors/auth-interceptor";
import axios from "axios";
import type { GeminiModelId } from "@/shared/services/summarize";

export type AtsAnalysisRecord = {
  score: number;
  ranking: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  model?: GeminiModelId;
};

export type CVSubmitPayload = {
  name: string;
  job: string;
  tag: string;
  elements: CVElement[];
  pageProperties: PageProperties;
  atsScore?: number | null;
  atsAnalysis?: AtsAnalysisRecord | null;
};

export type CVBuilderRecord = CVSubmitPayload & {
  _id: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type AddressSuggestion = {
  formatted?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  lat?: number;
  lon?: number;
  [key: string]: unknown;
};

export const fetchCVBuilderList = async () => {
  const response = await axiosInstance.get<{ cvBuilderList: CVBuilderRecord[] }>(`${apiUrl}cv-builder`);
  return response.data.cvBuilderList;
};

export const submitCV = async (payload: CVSubmitPayload) => {
  const response = await axiosInstance.post(`${apiUrl}cv-builder/create`, payload);
  return response.data;
};

export const updateCV = async (id: string, payload: CVSubmitPayload) => {
  const response = await axiosInstance.put(`${apiUrl}cv-builder/update/${id}`, payload);
  return response.data;
};

export const fetchCVBuilderById = async (id: string) => {
  const response = await axiosInstance.get(`${apiUrl}cv-builder/${id}`);
  return response.data.cvBuilder;
};

export const deleteCVBuilder = async (id: string) => {
  const response = await axiosInstance.delete(`cv-builder/delete/${id}`);
  return response.data;
};

export const fetchAddressSuggestions = async (text: string) => {
  const response = await axiosInstance.get<AddressSuggestion[]>(`${apiUrl}cv-builder/address-suggestions`, {
    params: { text },
  });
  return response.data;
};

export type AtsCheckPayload = {
  cvText: string;
  jobDescription: string;
  colors: string[];
  pageProperties: PageProperties;
  model?: GeminiModelId;
};

export type AtsCheckResponse = {
  score: number;
  ranking: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  model: GeminiModelId;
};

export type AtsErrorInfo = {
  title: string;
  message: string;
};

export const checkAtsScore = async (payload: AtsCheckPayload): Promise<AtsCheckResponse> => {
  const response = await axiosInstance.post<AtsCheckResponse>(`${apiUrl}cv-builder/ats-check`, payload, {
    timeout: 120_000,
  });
  return response.data;
};

export const parseAtsError = (error: unknown): AtsErrorInfo => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; code?: string } | undefined;
    const message = data?.message || error.message || "Something went wrong";

    if (error.response?.status === 429 || data?.code === "QUOTA_EXCEEDED") {
      return { title: "Rate limit reached", message };
    }

    if (data?.code === "API_KEY_MISSING" || data?.code === "API_KEY_INVALID") {
      return { title: "AI service unavailable", message };
    }

    if (data?.code === "MISSING_CV_TEXT" || data?.code === "MISSING_JOB_DESCRIPTION") {
      return { title: "Missing information", message };
    }

    return { title: "ATS check failed", message };
  }

  if (error instanceof Error) {
    return { title: "ATS check failed", message: error.message };
  }

  return { title: "ATS check failed", message: "Something went wrong" };
};
