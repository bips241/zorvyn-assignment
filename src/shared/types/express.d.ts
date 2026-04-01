// Express request augmentation for authenticated user context.
import type { Role } from '../../modules/access-control/access-control.types';

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        email: string;
        role: Role;
        status: 'ACTIVE' | 'INACTIVE';
      };
    }
  }
}

export {};
