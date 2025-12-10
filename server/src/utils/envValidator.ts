import logger from './logger';

interface RequiredEnvVars {
  [key: string]: string | undefined;
}

export function validateEnv(): void {
  const required: RequiredEnvVars = {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_URL: process.env.CLIENT_URL,
  };

  const missing: string[] = [];

  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    logger.error('Missing required environment variables:', { missing });
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Warn about default values
  if (process.env.JWT_SECRET === 'default-secret-key') {
    logger.warn('⚠️  Using default JWT_SECRET. Please set a secure secret in production!');
  }

  logger.info('✅ Environment variables validated');
}
