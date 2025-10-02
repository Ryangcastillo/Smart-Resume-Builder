import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('localhost'),
  
  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRE: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  
  // Neon Auth
  NEON_AUTH_URL: z.string().url().optional(),
  NEON_AUTH_CLIENT_ID: z.string().optional(),
  NEON_AUTH_CLIENT_SECRET: z.string().optional(),
  
  // Redis
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  
  // File Upload
  UPLOAD_MAX_SIZE: z.coerce.number().default(10485760),
  UPLOAD_PATH: z.string().default('uploads/'),
  ALLOWED_FILE_TYPES: z.string().default('pdf,doc,docx'),
  
  // Email
  EMAIL_SERVICE: z.string().optional(),
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASS: z.string().optional(),
  
  // LM Providers
  LM_PROVIDER: z.enum(['openrouter', 'openai']).default('openrouter'),
  LM_PRIMARY_MODEL: z.string().default('anthropic/claude-3.5-sonnet'),
  LM_FALLBACK_PROVIDER: z.enum(['openrouter', 'openai']).default('openai'),
  LM_FALLBACK_MODEL: z.string().default('gpt-4'),
  
  // Provider API Keys
  OPENROUTER_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  
  // External Services
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Monitoring
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  SENTRY_DSN: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: z.coerce.boolean().default(true),
});

export type EnvConfig = z.infer<typeof envSchema>;

let env: EnvConfig;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  process.exit(1);
}

export { env };