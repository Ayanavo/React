import { io } from "socket.io-client";
import { AUTH_CHANGED_EVENT, getAuthToken } from "@/shared/utils/auth-token";

const apiUrl = import.meta.env.VITE_API_URL;
const socketUrl = (apiUrl || "http://localhost:5000/api/").replace(/\/api\/?$/, "");

export const USER_LOGIN_STATUS_EVENT = "user:login-status";

let socket: ReturnType<typeof io> | null = null;
let authListenerRegistered = false;

const syncSocketAuth = (): void => {
  if (socket) {
    socket.auth = { token: getAuthToken() };
  }
};

const registerAuthChangeListener = (): void => {
  if (authListenerRegistered) return;
  authListenerRegistered = true;

  window.addEventListener(AUTH_CHANGED_EVENT, () => {
    if (!getAuthToken()) {
      disconnectSocket();
      return;
    }

    syncSocketAuth();

    if (socket?.connected) {
      socket.disconnect();
      socket.connect();
    }
  });
};

export const getSocket = () => {
  if (!socket) {
    registerAuthChangeListener();
    socket = io(socketUrl, {
      auth: { token: getAuthToken() },
      withCredentials: true,
      autoConnect: false,
    });
  }
  syncSocketAuth();
  return socket;
};

export const connectSocket = (): ReturnType<typeof io> => {
  const activeSocket = getSocket();
  syncSocketAuth();
  if (!activeSocket.connected) {
    activeSocket.connect();
  }
  return activeSocket;
};

export const reconnectSocket = (): ReturnType<typeof io> | null => {
  if (!getAuthToken()) {
    disconnectSocket();
    return null;
  }

  const activeSocket = getSocket();
  syncSocketAuth();
  if (activeSocket.connected) {
    activeSocket.disconnect();
  }
  activeSocket.connect();
  return activeSocket;
};

export const disconnectSocket = (): void => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
};
