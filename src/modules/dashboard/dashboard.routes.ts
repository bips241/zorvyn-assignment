// Dashboard endpoints are read-only and protected uniformly with `dashboard.read` permission.
import { Router } from 'express';

import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/validation/validate';
import {
	categoryBreakdownSchema,
	recentActivitySchema,
	summarySchema,
	trendsSchema,
} from './dashboard.schema';
import {
	getCategoryBreakdown,
	getRecentActivity,
	getSummary,
	getTrends,
} from './dashboard.service';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);
dashboardRouter.use(authorize('dashboard.read'));

dashboardRouter.get('/summary', validate(summarySchema), async (req, res, next) => {
	try {
		const data = await getSummary({
			fromDate: req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined,
			toDate: req.query.toDate ? new Date(String(req.query.toDate)) : undefined,
		});

		res.status(200).json({ data });
	} catch (error) {
		next(error);
	}
});

dashboardRouter.get('/category-breakdown', validate(categoryBreakdownSchema), async (req, res, next) => {
	try {
		const data = await getCategoryBreakdown({
			fromDate: req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined,
			toDate: req.query.toDate ? new Date(String(req.query.toDate)) : undefined,
		});

		res.status(200).json({ data });
	} catch (error) {
		next(error);
	}
});

dashboardRouter.get('/trends', validate(trendsSchema), async (req, res, next) => {
	try {
		const data = await getTrends({
			interval: (req.query.interval as 'monthly' | 'weekly') ?? 'monthly',
			fromDate: req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined,
			toDate: req.query.toDate ? new Date(String(req.query.toDate)) : undefined,
		});

		res.status(200).json({ data });
	} catch (error) {
		next(error);
	}
});

dashboardRouter.get('/recent-activity', validate(recentActivitySchema), async (req, res, next) => {
	try {
		const data = await getRecentActivity(Number(req.query.limit ?? 10));
		res.status(200).json({ data });
	} catch (error) {
		next(error);
	}
});
