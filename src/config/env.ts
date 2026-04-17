import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (v === undefined || v === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongodbUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  hmacKey: required('HMACPROCESS_KEY'),
  mailFrom: required('NODE_VERIFICATIONCODE_SENDING_EMAIL_ADDRESS'),
  mailPassword: required('NODE_VERIFICATIONCODE_SENDING_EMAIL_PASSWORD'),
} as const;
