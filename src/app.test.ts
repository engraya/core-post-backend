import { describe, it, expect } from 'vitest';
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
