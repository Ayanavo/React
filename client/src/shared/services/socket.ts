import { io } from "socket.io-client";
import { apiUrl } from "@/shared/interceptors/auth-interceptor";

let socket: ReturnType<typeof io> | null = null;
const authToken = sessionStorage.getItem("auth_token");

export const getSocket = () => {
  if (!socket) {
    socket = io(apiUrl, {
      auth: { token: authToken },
      withCredentials: true,
      autoConnect: false,
    });
  }
  socket.auth = { token: authToken };
  return socket;
};

export const disconnectSocket = (): void => {
  socket?.disconnect();
  socket = null;
};
