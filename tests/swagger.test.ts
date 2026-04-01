import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app';

describe('Swagger documentation', () => {
  it('serves OpenAPI JSON', async () => {
    const app = createApp();
    const response = await request(app).get('/api-docs.json');

    expect(response.status).toBe(200);
    expect(response.body?.openapi).toBe('3.0.3');
    expect(response.body?.paths?.['/api/v1/auth/login']).toBeDefined();
  });

  it('serves Swagger UI', async () => {
    const app = createApp();
    const response = await request(app).get('/api-docs');

    expect(response.status).toBe(301);
  });
});
