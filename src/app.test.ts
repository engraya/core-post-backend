import mongoose from 'mongoose';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from './app';

describe('createApp', () => {
  it('GET / returns standardized welcome payload', async () => {
    const app = createApp();
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'Hello from Express' });
  });
});

describe('Users API', () => {
  it('GET /api/v1/users with invalid id returns 400', async () => {
    const app = createApp();
    const res = await request(app).get('/api/v1/users/not-an-id');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid user id.');
  });
});

describe('Users API (integration)', () => {
  let mongoConnected = false;

  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/vitest-placeholder', {
        serverSelectionTimeoutMS: 2000,
      });
      mongoConnected = true;
    } catch {
      mongoConnected = false;
    }
  });

  afterAll(async () => {
    if (mongoConnected) {
      await mongoose.disconnect();
    }
  });

  it('GET /api/v1/users returns 200 and array-shaped data', async ({ skip }) => {
    skip(!mongoConnected, 'MongoDB not available');
    const app = createApp();
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
