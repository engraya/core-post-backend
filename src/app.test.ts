import mongoose from 'mongoose';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from './app';

/** Root route behavior of `createApp()`. */
describe('createApp', () => {
  /** Health check returns JSON the load balancer or tests can assert on. */
  it('GET / returns standardized welcome payload', async () => {
    const app = createApp();
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'Hello from Express' });
  });
});

/** User routes: validation and auth gates without a live DB. */
describe('Users API', () => {
  /** ObjectId format enforced before hitting MongoDB. */
  it('GET /api/v1/users with invalid id returns 400', async () => {
    const app = createApp();
    const res = await request(app).get('/api/v1/users/not-an-id');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid user id.');
  });

  /** Profile updates require a JWT. */
  it('PATCH /api/v1/users/me without auth returns 401', async () => {
    const app = createApp();
    const res = await request(app).patch('/api/v1/users/me').send({ displayName: 'Test' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  /** Bookmarks are private to the signed-in user. */
  it('GET /api/v1/users/me/bookmarks without auth returns 401', async () => {
    const app = createApp();
    const res = await request(app).get('/api/v1/users/me/bookmarks');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

/** Post id validation on public engagement/comment sub-routes. */
describe('Posts engagement API', () => {
  /** Comment listing rejects malformed `postId` before query. */
  it('GET /api/v1/posts/not-an-id/comments returns 400', async () => {
    const app = createApp();
    const res = await request(app).get('/api/v1/posts/not-an-id/comments');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid post id.');
  });

  /** Like count also validates `postId` as ObjectId. */
  it('GET /api/v1/posts/not-an-id/likes/count returns 400', async () => {
    const app = createApp();
    const res = await request(app).get('/api/v1/posts/not-an-id/likes/count');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid post id.');
  });
});

/** Optional integration test when MongoDB is reachable on the configured URI. */
describe('Users API (integration)', () => {
  let mongoConnected = false;

  /** Best-effort connect; failures skip the integration `it` instead of failing the suite. */
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

  /** Clean disconnect so the test worker can exit. */
  afterAll(async () => {
    if (mongoConnected) {
      await mongoose.disconnect();
    }
  });

  /** Lists users with populated posts when the database is up. */
  it('GET /api/v1/users returns 200 and array-shaped data', async ({ skip }) => {
    skip(!mongoConnected, 'MongoDB not available');
    const app = createApp();
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
