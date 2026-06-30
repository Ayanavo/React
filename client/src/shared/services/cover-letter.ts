import type { CVElement, PageProperties } from "@/lib/useCV";
import { apiUrl, axiosInstance } from "@/shared/interceptors/auth-interceptor";
import type { GeminiModelId } from "@/shared/services/summarize";

export type CoverLetterSubmitPayload = {
  name: string;
  job: string;
  tag: string;
  elements: CVElement[];
  pageProperties: PageProperties;
};

export type CoverLetterRecord = CoverLetterSubmitPayload & {
  _id: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type CoverLetterDraftResponse = {
  draft: string;
  sections: {
    salutation: string;
    body: string[];
    closing: string;
  };
  model: GeminiModelId;
};

export const fetchCoverLetterList = async () => {
  const response = await axiosInstance.get<{ coverLetterList: CoverLetterRecord[] }>(`${apiUrl}cover-letter`);
  return response.data.coverLetterList;
};

export const fetchCoverLetterById = async (id: string) => {
  const response = await axiosInstance.get(`${apiUrl}cover-letter/${id}`);
  return response.data.coverLetter as CoverLetterRecord;
};

export const submitCoverLetter = async (payload: CoverLetterSubmitPayload) => {
  const response = await axiosInstance.post(`${apiUrl}cover-letter/create`, payload);
  return response.data;
};

export const updateCoverLetter = async (id: string, payload: CoverLetterSubmitPayload) => {
  const response = await axiosInstance.put(`${apiUrl}cover-letter/update/${id}`, payload);
  return response.data;
};

export const deleteCoverLetter = async (id: string) => {
  const response = await axiosInstance.delete(`${apiUrl}cover-letter/delete/${id}`);
  return response.data;
};

export const generateCoverLetterDraft = async (payload: {
  jobSummary: string;
  sourceText?: string;
  model?: GeminiModelId;
  applicantName?: string;
  applicantRole?: string;
}) => {
  const response = await axiosInstance.post<CoverLetterDraftResponse>(`${apiUrl}cover-letter/generate-draft`, payload);
  return response.data;
};
