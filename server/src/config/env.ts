import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  MAX_FILE_SIZE: number;
  UPLOAD_PATH: string;
  STORAGE_TYPE: 'local' | 's3';
  CLIENT_URL: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  AWS_S3_BUCKET?: string;
  OPENAI_API_KEY?: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

const config: EnvConfig = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-streaming',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '2147483648', 10),
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  STORAGE_TYPE: (process.env.STORAGE_TYPE as 'local' | 's3') || 'local',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};

export default config;
