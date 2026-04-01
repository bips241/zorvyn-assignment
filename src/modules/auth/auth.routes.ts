// Auth routes are intentionally small: validate input, call service, return normalized response.
import { Router } from 'express';

import { validate } from '../../shared/validation/validate';
import { authenticate } from '../../shared/middleware/authenticate';
import { loginSchema } from './auth.schema';
import { loginUser } from './auth.service';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), async (req, res, next) => {
	try {
		const result = await loginUser({
			email: req.body.email,
			password: req.body.password,
		});

		res.status(200).json({
			data: result,
		});
	} catch (error) {
		next(error);
	}
});

authRouter.get('/me', authenticate, (req, res) => {
	// `authenticate` already resolves and verifies the user, so we only echo that context back.
	res.status(200).json({
		data: {
			user: req.authUser,
		},
	});
});
