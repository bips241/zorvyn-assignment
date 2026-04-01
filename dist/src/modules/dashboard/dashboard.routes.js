"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
// Dashboard endpoints are read-only and protected uniformly with `dashboard.read` permission.
const express_1 = require("express");
const authenticate_1 = require("../../shared/middleware/authenticate");
const authorize_1 = require("../../shared/middleware/authorize");
const validate_1 = require("../../shared/validation/validate");
const dashboard_schema_1 = require("./dashboard.schema");
const dashboard_service_1 = require("./dashboard.service");
exports.dashboardRouter = (0, express_1.Router)();
exports.dashboardRouter.use(authenticate_1.authenticate);
exports.dashboardRouter.use((0, authorize_1.authorize)('dashboard.read'));
exports.dashboardRouter.get('/summary', (0, validate_1.validate)(dashboard_schema_1.summarySchema), async (req, res, next) => {
    try {
        const data = await (0, dashboard_service_1.getSummary)({
            fromDate: req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined,
            toDate: req.query.toDate ? new Date(String(req.query.toDate)) : undefined,
        });
        res.status(200).json({ data });
    }
    catch (error) {
        next(error);
    }
});
exports.dashboardRouter.get('/category-breakdown', (0, validate_1.validate)(dashboard_schema_1.categoryBreakdownSchema), async (req, res, next) => {
    try {
        const data = await (0, dashboard_service_1.getCategoryBreakdown)({
            fromDate: req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined,
            toDate: req.query.toDate ? new Date(String(req.query.toDate)) : undefined,
        });
        res.status(200).json({ data });
    }
    catch (error) {
        next(error);
    }
});
exports.dashboardRouter.get('/trends', (0, validate_1.validate)(dashboard_schema_1.trendsSchema), async (req, res, next) => {
    try {
        const data = await (0, dashboard_service_1.getTrends)({
            interval: req.query.interval ?? 'monthly',
            fromDate: req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined,
            toDate: req.query.toDate ? new Date(String(req.query.toDate)) : undefined,
        });
        res.status(200).json({ data });
    }
    catch (error) {
        next(error);
    }
});
exports.dashboardRouter.get('/recent-activity', (0, validate_1.validate)(dashboard_schema_1.recentActivitySchema), async (req, res, next) => {
    try {
        const data = await (0, dashboard_service_1.getRecentActivity)(Number(req.query.limit ?? 10));
        res.status(200).json({ data });
    }
    catch (error) {
        next(error);
    }
});
