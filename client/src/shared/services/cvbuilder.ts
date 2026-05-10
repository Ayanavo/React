import type { CVElement, PageProperties } from "@/lib/useCV";
import { apiUrl, axiosInstance } from "@/shared/interceptors/auth-interceptor";

export type CVSubmitPayload = {
  name: string;
  job: string;
  tag: string;
  elements: CVElement[];
  pageProperties: PageProperties;
};

export type CVBuilderRecord = CVSubmitPayload & {
  _id: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  updatedAt: string;
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
