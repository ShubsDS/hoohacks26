import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { getGridCell } from './rooms';

export function registerSocketHandlers(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = jwt.verify(token, env.SUPABASE_JWT_SECRET) as { sub: string; isAdmin: boolean };
      socket.data.userId = payload.sub;
      socket.data.isAdmin = payload.isAdmin ?? false;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    if (socket.data.isAdmin) {
      socket.join('admin:dashboard');
    }

    socket.on('location:update', ({ lat, lng }: { lat: number; lng: number }) => {
      const newCell = getGridCell(lat, lng);
      const newRoom = `geo:${newCell}`;

      // Leave old geo rooms, join new one
      const currentRooms = Array.from(socket.rooms).filter(r => r.startsWith('geo:'));
      for (const room of currentRooms) {
        if (room !== newRoom) socket.leave(room);
      }
      socket.join(newRoom);
    });

    socket.on('report:subscribe', ({ lat, lng }: { lat: number; lng: number }) => {
      const cell = getGridCell(lat, lng);
      socket.join(`geo:${cell}`);
    });

    socket.on('disconnect', () => {
      // cleanup handled automatically by socket.io
    });
  });
}
