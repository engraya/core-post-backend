import { hash, compare } from 'bcryptjs';
import { createHmac } from 'crypto';

export const doHash = async (value: string, saltValue: number): Promise<string> => {
  return hash(value, saltValue);
};

export const doHashValidation = async (value: string, hashedValue: string): Promise<boolean> => {
  return compare(value, hashedValue);
};

export const hmacProcess = (value: string | Buffer, key: string | Buffer): string => {
  return createHmac('sha256', key).update(value).digest('hex');
};
