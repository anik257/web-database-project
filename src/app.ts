import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './utils/logger';
import apiRouter from './routes';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/error.middleware';
import { ApiError } from './utils/api-error';

// Initialize express app
const app: Application = express();

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Customize this for production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger Middleware mapped to Winston logger
const morganMiddleware = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }
);
app.use(morganMiddleware);

// API routes
app.use('/api/v1', apiRouter);
app.use('/api/auth', authRoutes);

// Fallback route for unmatched endpoints (404 Not Found)
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Requested route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized error handler (must be registered last)
app.use(errorHandler);

export default app;
