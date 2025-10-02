import { env } from './env';

export const config = {
  // Server
  server: {
    port: env.PORT,
    host: env.HOST,
    nodeEnv: env.NODE_ENV,
  },
  
  // Database
  database: {
    url: env.DATABASE_URL,
    directUrl: env.DIRECT_URL,
  },
  
  // Authentication
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpire: env.JWT_EXPIRE,
    bcryptRounds: env.BCRYPT_ROUNDS,
    neonAuth: {
      url: env.NEON_AUTH_URL,
      clientId: env.NEON_AUTH_CLIENT_ID,
      clientSecret: env.NEON_AUTH_CLIENT_SECRET,
    },
  },
  
  // Redis
  redis: {
    url: env.REDIS_URL,
    password: env.REDIS_PASSWORD,
  },
  
  // File Upload
  upload: {
    maxSize: env.UPLOAD_MAX_SIZE,
    path: env.UPLOAD_PATH,
    allowedTypes: env.ALLOWED_FILE_TYPES.split(','),
  },
  
  // Email
  email: {
    service: env.EMAIL_SERVICE,
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  
  // LM Providers
  lmProviders: {
    primary: {
      provider: env.LM_PROVIDER,
      model: env.LM_PRIMARY_MODEL,
      apiKey: env.LM_PROVIDER === 'openrouter' ? env.OPENROUTER_API_KEY : env.OPENAI_API_KEY,
    },
    fallback: {
      provider: env.LM_FALLBACK_PROVIDER,
      model: env.LM_FALLBACK_MODEL,
      apiKey: env.LM_FALLBACK_PROVIDER === 'openrouter' ? env.OPENROUTER_API_KEY : env.OPENAI_API_KEY,
    },
  },
  
  // External Services
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },
  
  // Monitoring
  monitoring: {
    logLevel: env.LOG_LEVEL,
    sentryDsn: env.SENTRY_DSN,
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  },
  
  // CORS
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: env.CORS_CREDENTIALS,
  },
  
  // Feature Flags
  features: {
    enableAnalytics: env.NODE_ENV === 'production',
    enableAISuggestions: true,
    enableRealTime: true,
    enableFileUpload: true,
  },
};