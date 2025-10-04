import { request } from "../interceptors/auth-interceptor";
const apiUrl = import.meta.env.VITE_API_URL;

export const getCurrentLocationAPI = async (data: any) => {
  const response = await request({
    method: "POST",
    url: `${apiUrl}setting/getCurrentLocation`,
    data,
  });
  return response;
};

export const getStateListAPI = async () => {
  interface LocationInfo {
    id: number;
    name: string;
    iso2: string;
  }

  const response = await request<Array<LocationInfo>>({
    method: "GET",
    url: `${apiUrl}setting/getStateList`,
  });
  return response;
};

export const validatePincodeAPI = async (data: { pincode: string; state: string }) => {
  const response = await request<Array<any>>({
    method: "POST",
    url: `${apiUrl}setting/validatePincode`,
    data,
  });
  return response;
};
