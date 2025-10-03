// Ensure required environment variables have sensible defaults for tests
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PORT = process.env.PORT || '3001';
// Prisma/database envs may be required by other modules; provide dummy but valid values
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'x'.repeat(32);

import request from 'supertest';
import app from '../app';

describe('Health endpoint', () => {
  it('GET /health should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
