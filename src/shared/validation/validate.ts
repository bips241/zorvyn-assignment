// Generic request validator used in routes to keep handlers focused on business logic.
import { RequestHandler } from 'express';
import { AnyZodObject, ZodError } from 'zod';

import { HttpError } from '../http/http-error';

export const validate = (schema: AnyZodObject): RequestHandler => {
  return (req, _res, next) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new HttpError(400, 'VALIDATION_ERROR', 'Invalid request input', error.issues));
      }
      return next(error);
    }
  };
};
