import { apiUrl, axiosInstance } from "@/shared/interceptors/auth-interceptor";

const base = `${apiUrl}master-access`;

export const fetchUsers = async () => {
  const response = await axiosInstance.get<{ users: any[] }>(`${base}/users`);
  return response.data.users || [];
};

export const deleteUser = async (id: string) => {
  const response = await axiosInstance.delete(`${base}/delete/${id}`);
  return response.data;
};

export const fetchPermissions = async (userId: string) => {
  const response = await axiosInstance.get<{
    permissions?: { allowedRoutes: string[]; isLoggedIn?: boolean; lastLoginAt?: string | null };
  }>(`${base}/permissions/${userId}`);
  return response.data || { allowedRoutes: [] };
};

export const savePermissions = async (userId: string, routes: string[]) => {
  const response = await axiosInstance.post(`${base}/save`, { userId, routes });
  return response.data;
};

export const fetchPermissionsByToken = async () => {
  const response = await axiosInstance.post<Array<string>>(`${base}/permissionsAuth`);
  return response.data || [];
};
