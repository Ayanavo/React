import type { Server as HttpServer } from "http";
import jwt, { Secret } from "jsonwebtoken";
import { Server } from "socket.io";
import { corsAllowlist, isOriginAllowed } from "../config/cors.js";

export const USER_LOGIN_STATUS_EVENT = "user:login-status";

let io: Server | null = null;

export const initializeSocket = (server: HttpServer): Server => {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: (origin, cb) => {
        if (isOriginAllowed(origin)) return cb(null, origin ?? corsAllowlist);
        cb(new Error(`Not allowed by CORS: ${origin}`), false);
      },
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.use((socket, next) => {
    const token =
      (socket.handshake.auth?.token as string | undefined) ??
      socket.handshake.headers.authorization?.replace("Bearer ", "");

    if (!token) return next(new Error("Authentication required"));

    jwt.verify(token, process.env.API_SECRET_KEY as Secret, (err, decoded) => {
      if (err) return next(new Error("Invalid or expired token"));
      const payload = decoded as { id?: string };
      if (payload?.id) {
        socket.data.userId = payload.id;
      }
      next();
    });
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}${socket.data.userId ? ` (user: ${socket.data.userId})` : ""}`);
    socket.on("disconnect", () => console.log(`Socket disconnected: ${socket.id}`));
  });

  return io;
};

export type UserLoginStatusPayload = {
  userId: string;
  isLoggedIn: boolean;
  lastLoginAt?: string | null;
  lastLogoutAt?: string | null;
  totalTimeSpentMs?: number;
  currentSessionStartedAt?: string | null;
};

export const emitUserLoginStatus = (
  userId: string,
  isLoggedIn: boolean,
  stats: Omit<UserLoginStatusPayload, "userId" | "isLoggedIn"> = {}
): void => {
  io?.emit(USER_LOGIN_STATUS_EVENT, { userId, isLoggedIn, ...stats });
};

export const shutdownSocket = async (): Promise<void> => {
  if (!io) return;
  await io.close();
  io = null;
};
