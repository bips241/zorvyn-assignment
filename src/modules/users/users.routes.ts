// Users routes are admin-governed. Middleware order is: auth -> permission -> validation -> handler.
import { Router } from 'express';

import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/validation/validate';
import {
	createUserSchema,
	listUsersSchema,
	updateUserSchema,
	updateUserStatusSchema,
} from './users.schema';
import { createUser, listUsers, updateUser, updateUserStatus } from './users.service';

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.post('/', authorize('users.create'), validate(createUserSchema), async (req, res, next) => {
	try {
		const user = await createUser(req.body);
		res.status(201).json({ data: user });
	} catch (error) {
		next(error);
	}
});

usersRouter.get('/', authorize('users.read'), validate(listUsersSchema), async (req, res, next) => {
	try {
		const result = await listUsers({
			role: req.query.role as 'VIEWER' | 'ANALYST' | 'ADMIN' | undefined,
			status: req.query.status as 'ACTIVE' | 'INACTIVE' | undefined,
			page: Number(req.query.page ?? 1),
			pageSize: Number(req.query.pageSize ?? 20),
		});

		res.status(200).json({
			data: result.users,
			meta: result.meta,
		});
	} catch (error) {
		next(error);
	}
});

usersRouter.patch('/:id', authorize('users.update'), validate(updateUserSchema), async (req, res, next) => {
	try {
		const user = await updateUser({
			id: req.params.id,
			...req.body,
		});

		res.status(200).json({ data: user });
	} catch (error) {
		next(error);
	}
});

usersRouter.patch(
	'/:id/status',
	authorize('users.status.update'),
	validate(updateUserStatusSchema),
	async (req, res, next) => {
		try {
			const user = await updateUserStatus(req.params.id, req.body.status);
			res.status(200).json({ data: user });
		} catch (error) {
			next(error);
		}
	},
);
