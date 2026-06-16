import { apiUrl, axiosInstance } from "@/shared/interceptors/auth-interceptor";

const base = `${apiUrl}master-access`;

export type UserPermissions = {
  allowedRoutes: string[];
  menuOrder: string[];
  isLoggedIn?: boolean;
  lastLoginAt?: string | null;
};

export type AuthPermissions = {
  allowedRoutes: string[];
  menuOrder: string[];
};

export const fetchUsers = async () => {
  const response = await axiosInstance.get<{ users: any[] }>(`${base}/users`);
  return response.data.users || [];
};

export const deleteUser = async (id: string) => {
  const response = await axiosInstance.delete(`${base}/delete/${id}`);
  return response.data;
};

export const fetchPermissions = async (userId: string) => {
  const response = await axiosInstance.get<{ permissions?: UserPermissions }>(`${base}/permissions/${userId}`);
  return response.data || { allowedRoutes: [], menuOrder: [] };
};

export const savePermissions = async (userId: string, routes: string[], menuOrder: string[]) => {
  const response = await axiosInstance.post(`${base}/save`, { userId, routes, menuOrder });
  return response.data;
};

export const fetchPermissionsByToken = async (): Promise<AuthPermissions> => {
  const response = await axiosInstance.post<AuthPermissions>(`${base}/permissionsAuth`);
  return response.data || { allowedRoutes: [], menuOrder: [] };
};
