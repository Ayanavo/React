import { axiosInstance } from "@/shared/interceptors/auth-interceptor";
const apiUrl = import.meta.env.VITE_API_URL;

export type CompanyPayload = {
  companyName: string;
  designation: string;
  fromMonth: string;
  fromYear: string;
  toMonth: string;
  toYear: string;
  isPresent: boolean;
};

export type UpdateProfilePayload = {
  photoURL?: string;
  firstName: string;
  lastName: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  companies?: CompanyPayload[];
};

export const updateProfileAPI = async (data: UpdateProfilePayload) => {
  const response = await axiosInstance.post(`${apiUrl}auth/saveUserProfile`, data);
  return response.data;
};

export const getCurrentLocationAPI = async (data: any) => {
  const response = await axiosInstance.post(`${apiUrl}setting/getCurrentLocation`, data);
  return response.data;
};

export const getStateListAPI = async () => {
  interface LocationInfo {
    id: number;
    name: string;
    iso2: string;
  }

  const response = await axiosInstance.get<Array<LocationInfo>>(`${apiUrl}setting/getStateList`);
  return response.data;
};

export const validatePincodeAPI = async (data: { pincode: string; state: string }) => {
  const response = await axiosInstance.post<Array<any>>(`${apiUrl}setting/validatePincode`, data);
  return response.data;
};
