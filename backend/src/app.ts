import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from './config';
import { logger } from './logger';
import authMiddleware from './middleware/auth';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: config.cors.credentials }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
  })
);

// Logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Auth middleware placeholder (Neon Auth integration goes here)
app.use(authMiddleware);

// API routes
app.use('/api', routes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

export default app;
