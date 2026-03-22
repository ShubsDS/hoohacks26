import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { env } from './config/env';
import { setIO } from './config/socket';
import { registerSocketHandlers } from './socket/handlers';
import authRoutes from './routes/auth.routes';
import reportsRoutes from './routes/reports.routes';
import locationRoutes from './routes/location.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

setIO(io);
registerSocketHandlers(io);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/admin', adminRoutes);

const PORT = parseInt(env.PORT) || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
