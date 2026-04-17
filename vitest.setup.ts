process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/vitest-placeholder';
process.env.JWT_SECRET ??= 'test-jwt-secret-minimum-32-characters-long';
process.env.HMACPROCESS_KEY ??= 'test-hmac-secret-minimum-32-characters-long';
process.env.NODE_VERIFICATIONCODE_SENDING_EMAIL_ADDRESS ??= 'vitest@example.com';
process.env.NODE_VERIFICATIONCODE_SENDING_EMAIL_PASSWORD ??= 'not-used-in-tests';
process.env.PORT ??= '3999';
