import dotenv from 'dotenv';

dotenv.config();

/** Returns an env var or throws if it is missing or empty (fail-fast at process start). */
function required(name: string): string {
  const v = process.env[name];
  if (v === undefined || v === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

/** Application configuration loaded from the environment. */
export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongodbUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  hmacKey: required('HMACPROCESS_KEY'),
  mailFrom: required('NODE_VERIFICATIONCODE_SENDING_EMAIL_ADDRESS'),
  mailPassword: required('NODE_VERIFICATIONCODE_SENDING_EMAIL_PASSWORD'),
} as const;
