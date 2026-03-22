import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { env } from './config/env';
import { initSocket } from './config/socket';
import { registerSocketHandlers } from './socket/handlers';
import authRoutes from './routes/auth.routes';
import reportsRoutes from './routes/reports.routes';
import locationRoutes from './routes/location.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Socket.io
const io = initSocket(httpServer);
registerSocketHandlers(io);

httpServer.listen(env.PORT, () => {
  console.log(`Backend running on http://localhost:${env.PORT}`);
});
