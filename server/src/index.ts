import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Server as SocketServer } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import config from './config/env';
import { connectMongoDB, connectRedis } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';

// Routes
import authRoutes from './routes/authRoutes';
import movieRoutes from './routes/movieRoutes';
import userRoutes from './routes/userRoutes';
import searchRoutes from './routes/searchRoutes';
import adminRoutes from './routes/adminRoutes';
import proxyRoutes from './routes/proxyRoutes';

const app: Application = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new SocketServer(httpServer, {
  cors: {
    origin: config.CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));
app.use(cors({ origin: config.CLIENT_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
import { requestLogger } from './middleware/requestLogger';
if (config.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', config.UPLOAD_PATH)));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/user', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/proxy', proxyRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info('User connected:', { socketId: socket.id });

  // Watch party events
  socket.on('party:create', async () => {
    const roomCode = Math.random().toString(36).substring(7).toUpperCase();
    socket.join(roomCode);
    socket.emit('party:created', { roomCode });
    logger.debug('Watch party created:', { roomCode, socketId: socket.id });
  });

  socket.on('party:join', (data) => {
    socket.join(data.roomCode);
    socket.to(data.roomCode).emit('party:user-joined', { userId: socket.id });
    logger.debug('User joined watch party:', { roomCode: data.roomCode, socketId: socket.id });
  });

  socket.on('party:sync', (data) => {
    socket.to(data.roomCode).emit('party:sync', data);
  });

  socket.on('party:chat', (data) => {
    socket.to(data.roomCode).emit('party:chat', data);
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected:', { socketId: socket.id });
  });
});

// Error handling
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Validate environment variables
    const { validateEnv } = await import('./utils/envValidator');
    validateEnv();

    // Connect to databases
    await connectMongoDB();
    await connectRedis();

    // Start HTTP server
    httpServer.listen(config.PORT, () => {
      logger.info(`🚀 Server running on port ${config.PORT}`);
      logger.info(`📍 Environment: ${config.NODE_ENV}`);
      logger.info(`🔗 http://localhost:${config.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });
});

startServer();

export { io };
