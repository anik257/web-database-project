import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './utils/logger';
import apiRouter from './routes';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './config/swagger.json';

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

// API Documentation (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API routes
app.use('/api', apiRouter);
app.use('/api/auth', authRoutes);

// Fallback route for unmatched endpoints (404 Not Found)
app.use(notFoundHandler);

// Centralized error handler (must be registered last)
app.use(errorHandler);

export default app;
