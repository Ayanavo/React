// src/websockets/socket.ts

import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server | null = null;

export const initializeSocket = (
  server: HttpServer
): Server => {
  if (io) {
    return io;
  }

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:5173",
  ].filter(Boolean) as string[];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"],
    },

    transports: ["websocket", "polling"],

    pingInterval: 25000,
    pingTimeout: 60000,
  });

  registerSocketEvents(io);
  return io;
};

const registerSocketEvents = (io: Server): void => {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      console.log(
        `❌ Socket disconnected: ${socket.id} | Reason: ${reason}`
      );
    });

    socket.on("error", (error) => {
      console.error(
        `⚠️ Socket error: ${socket.id}`,
        error
      );
    });
  });
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized."
    );
  }

  return io;
};