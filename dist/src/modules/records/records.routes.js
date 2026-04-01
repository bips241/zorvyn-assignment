"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordsRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../shared/middleware/authenticate");
const authorize_1 = require("../../shared/middleware/authorize");
const validate_1 = require("../../shared/validation/validate");
const records_schema_1 = require("./records.schema");
const records_service_1 = require("./records.service");
exports.recordsRouter = (0, express_1.Router)();
exports.recordsRouter.use(authenticate_1.authenticate);
exports.recordsRouter.post('/', (0, authorize_1.authorize)('records.create'), (0, validate_1.validate)(records_schema_1.createRecordSchema), async (req, res, next) => {
    try {
        const record = await (0, records_service_1.createRecord)({
            ...req.body,
            actorId: req.authUser.id,
        });
        res.status(201).json({ data: record });
    }
    catch (error) {
        next(error);
    }
});
exports.recordsRouter.get('/', (0, authorize_1.authorize)('records.read'), (0, validate_1.validate)(records_schema_1.listRecordsSchema), async (req, res, next) => {
    try {
        const result = await (0, records_service_1.listRecords)({
            type: req.query.type,
            category: req.query.category,
            fromDate: req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined,
            toDate: req.query.toDate ? new Date(String(req.query.toDate)) : undefined,
            page: Number(req.query.page ?? 1),
            pageSize: Number(req.query.pageSize ?? 20),
        });
        res.status(200).json({
            data: result.records,
            meta: result.meta,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.recordsRouter.get('/:id', (0, authorize_1.authorize)('records.read'), (0, validate_1.validate)(records_schema_1.recordByIdSchema), async (req, res, next) => {
    try {
        const record = await (0, records_service_1.getRecordById)(req.params.id);
        res.status(200).json({ data: record });
    }
    catch (error) {
        next(error);
    }
});
exports.recordsRouter.patch('/:id', (0, authorize_1.authorize)('records.update'), (0, validate_1.validate)(records_schema_1.updateRecordSchema), async (req, res, next) => {
    try {
        const record = await (0, records_service_1.updateRecord)({
            id: req.params.id,
            ...req.body,
            actorId: req.authUser.id,
        });
        res.status(200).json({ data: record });
    }
    catch (error) {
        next(error);
    }
});
exports.recordsRouter.delete('/:id', (0, authorize_1.authorize)('records.delete'), (0, validate_1.validate)(records_schema_1.recordByIdSchema), async (req, res, next) => {
    try {
        await (0, records_service_1.deleteRecord)(req.params.id);
        res.status(200).json({ data: { deleted: true } });
    }
    catch (error) {
        next(error);
    }
});
