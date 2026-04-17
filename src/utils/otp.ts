import { randomInt } from 'crypto';

/** Cryptographically strong 6-digit OTP string (leading zeros preserved). */
export function generateSixDigitOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}
