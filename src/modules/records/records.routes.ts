// Records routes enforce read/write permissions per endpoint so role behavior is explicit in one place.
import { Router } from 'express';

import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/validation/validate';
import { createRecordSchema, listRecordsSchema, recordByIdSchema, updateRecordSchema } from './records.schema';
import { createRecord, deleteRecord, getRecordById, listRecords, updateRecord } from './records.service';

export const recordsRouter = Router();

recordsRouter.use(authenticate);

recordsRouter.post(
	'/',
	authorize('records.create'),
	validate(createRecordSchema),
	async (req, res, next) => {
		try {
			const record = await createRecord({
				...req.body,
				actorId: req.authUser!.id,
			});
			res.status(201).json({ data: record });
		} catch (error) {
			next(error);
		}
	},
);

recordsRouter.get('/', authorize('records.read'), validate(listRecordsSchema), async (req, res, next) => {
	try {
		const result = await listRecords({
			type: req.query.type as 'INCOME' | 'EXPENSE' | undefined,
			category: req.query.category as string | undefined,
			fromDate: req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined,
			toDate: req.query.toDate ? new Date(String(req.query.toDate)) : undefined,
			page: Number(req.query.page ?? 1),
			pageSize: Number(req.query.pageSize ?? 20),
		});

		res.status(200).json({
			data: result.records,
			meta: result.meta,
		});
	} catch (error) {
		next(error);
	}
});

recordsRouter.get('/:id', authorize('records.read'), validate(recordByIdSchema), async (req, res, next) => {
	try {
		const record = await getRecordById(req.params.id);
		res.status(200).json({ data: record });
	} catch (error) {
		next(error);
	}
});

recordsRouter.patch(
	'/:id',
	authorize('records.update'),
	validate(updateRecordSchema),
	async (req, res, next) => {
		try {
			const record = await updateRecord({
				id: req.params.id,
				...req.body,
				actorId: req.authUser!.id,
			});
			res.status(200).json({ data: record });
		} catch (error) {
			next(error);
		}
	},
);

recordsRouter.delete(
	'/:id',
	authorize('records.delete'),
	validate(recordByIdSchema),
	async (req, res, next) => {
		try {
			await deleteRecord(req.params.id);
			res.status(200).json({ data: { deleted: true } });
		} catch (error) {
			next(error);
		}
	},
);
