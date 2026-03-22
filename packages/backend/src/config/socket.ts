import { Server as IOServer } from 'socket.io';

let io: IOServer;

export function setIO(server: IOServer) {
  io = server;
}

export function getIO(): IOServer {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
