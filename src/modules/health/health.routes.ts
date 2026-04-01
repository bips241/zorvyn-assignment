// Lightweight health endpoint for uptime checks and deployment smoke tests.
import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.status(200).json({
    data: {
      service: 'zorvyn-finance-backend',
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});
