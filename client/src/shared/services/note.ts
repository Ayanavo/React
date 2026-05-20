import { apiUrl, axiosInstance } from "@/shared/interceptors/auth-interceptor";

export type NotePayload = {
  title: string;
  body: string;
  color: string;
  image: string[];
};

export type NoteRecord = NotePayload & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const noteURL = `${apiUrl}notes`;

export const getNotes = async () => {
  const response = await axiosInstance.get<{ notes: NoteRecord[] }>(noteURL);
  return response.data.notes;
};

export const createNote = async (postData: NotePayload) => {
  const response = await axiosInstance.post(`${noteURL}/create`, postData);
  return response.data;
};

export const getNoteById = async (noteId: string) => {
  const response = await axiosInstance.get<{ note: NoteRecord }>(`${noteURL}/${noteId}`);
  return response.data.note;
};

export const updateNote = async (noteId: string, postData: NotePayload) => {
  const response = await axiosInstance.put(`${noteURL}/update/${noteId}`, postData);
  return response.data;
};

export const deleteNote = async (noteId: string) => {
  const response = await axiosInstance.delete(`${noteURL}/delete/${noteId}`);
  return response.data;
};
