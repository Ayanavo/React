import { io } from "socket.io-client";
import { apiUrl } from "@/shared/interceptors/auth-interceptor";
import { getAuthToken } from "@/shared/utils/auth-token";

const socketUrl = (apiUrl || "http://localhost:5000/api/").replace(/\/api\/?$/, "");

let socket: ReturnType<typeof io> | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(socketUrl, {
      auth: { token: getAuthToken() },
      withCredentials: true,
      autoConnect: false,
    });
  }
  socket.auth = { token: getAuthToken() };
  return socket;
};

export const disconnectSocket = (): void => {
  socket?.disconnect();
  socket = null;
};
