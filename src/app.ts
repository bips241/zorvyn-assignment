// Main Express app composition. I kept route registration centralized here so reviewers can see the API surface quickly.
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { openApiSpec } from './docs/openapi';
import { authRouter } from './modules/auth/auth.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { healthRouter } from './modules/health/health.routes';
import { recordsRouter } from './modules/records/records.routes';
import { usersRouter } from './modules/users/users.routes';
import { globalErrorHandler } from './shared/middleware/global-error-handler';
import { notFoundHandler } from './shared/middleware/not-found-handler';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());

  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/records', recordsRouter);
  app.use('/api/v1/dashboard', dashboardRouter);

  // I expose both UI and raw JSON so this works for human review and tooling (Postman/importers/CI checks).
  app.get('/api-docs.json', (req, res) => {
    const host = req.get('host');
    const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const protocol = forwardedProto || req.protocol;
    const currentOrigin = host ? `${protocol}://${host}` : undefined;

    const existingServers = openApiSpec.servers ?? [];
    const servers =
      process.env.NODE_ENV === 'production'
        ? currentOrigin
          ? [{ url: currentOrigin, description: 'Current server' }]
          : existingServers.filter((server) => server.url !== 'http://localhost:4000')
        : currentOrigin
          ? [
              { url: currentOrigin, description: 'Current server' },
              ...existingServers.filter((server) => server.url !== currentOrigin),
            ]
          : existingServers;

    res.status(200).json({ ...openApiSpec, servers });
  });
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: { url: '/api-docs.json' },
    })
  );

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};
