import { apiUrl, axiosInstance } from "@/shared/interceptors/auth-interceptor";

export type TagPayload = {
  name: string;
  description: string;
  color: string;
};

export type TagRecord = TagPayload & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const tagURL = `${apiUrl}tags`;

export const getTags = async () => {
  const response = await axiosInstance.get<{ tags: TagRecord[] }>(tagURL);
  return response.data.tags;
};

export const createTag = async (postData: TagPayload) => {
  const response = await axiosInstance.post(`${tagURL}/create`, postData);
  return response.data;
};

export const getTagById = async (tagId: string) => {
  const response = await axiosInstance.get<{ tag: TagRecord }>(`${tagURL}/${tagId}`);
  return response.data.tag;
};

export const updateTag = async (tagId: string, postData: TagPayload) => {
  const response = await axiosInstance.put(`${tagURL}/update/${tagId}`, postData);
  return response.data;
};

export const deleteTag = async (tagId: string) => {
  const response = await axiosInstance.delete(`${tagURL}/delete/${tagId}`);
  return response.data;
};
