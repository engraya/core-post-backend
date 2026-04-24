import { hash, compare } from 'bcryptjs';
import { createHmac } from 'crypto';

/** Bcrypt-hashes a string (e.g. password) with the given cost factor. */
export const doHash = async (value: string, saltValue: number): Promise<string> => {
  return hash(value, saltValue);
};

/** Constant-time compare of plaintext to a stored bcrypt hash. */
export const doHashValidation = async (value: string, hashedValue: string): Promise<boolean> => {
  return compare(value, hashedValue);
};

/** HMAC-SHA256 hex digest (used for stored OTPs and other secrets at rest). */
export const hmacProcess = (value: string | Buffer, key: string | Buffer): string => {
  return createHmac('sha256', key).update(value).digest('hex');
};
