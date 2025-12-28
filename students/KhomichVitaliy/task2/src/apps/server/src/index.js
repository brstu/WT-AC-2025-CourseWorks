import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config.js';
import { connectDB } from './prisma.js';
import { errorHandler, notFound } from './middlewares/error.js';
import { authMiddleware } from './middlewares/auth.js';
import { rateLimiter } from './middlewares/rateLimiter.js';
import { logger, requestLogger } from './middlewares/logger.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import projectRoutes from './routes/projects.js';
import issueRoutes from './routes/issues.js';
import commentRoutes from './routes/comments.js';
import labelRoutes from './routes/labels.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.clientUrl,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-project', (projectId) => {
    socket.join(`project:${projectId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('io', io);

app.use(helmet());
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/issues', authMiddleware, issueRoutes);
app.use('/api/comments', authMiddleware, commentRoutes);
app.use('/api/labels', authMiddleware, labelRoutes);

app.get('/api-docs', (req, res) => {
  res.redirect('https://app.swaggerhub.com/apis/TASKMANAGER_API/task-manager/1.0.0');
});

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    
    httpServer.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`API Documentation: http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, io };