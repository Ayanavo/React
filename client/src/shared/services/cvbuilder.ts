import type { CVElement, PageProperties } from "@/lib/useCV";
import { apiUrl, axiosInstance } from "@/shared/services/api-header";

export type CVSubmitPayload = {
  name: string;
  job: string;
  tag: string;
  elements: CVElement[];
  pageProperties: PageProperties;
};

export type CVBuilderRecord = CVSubmitPayload & {
  _id: string;
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
