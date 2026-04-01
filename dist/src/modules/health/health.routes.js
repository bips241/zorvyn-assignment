"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
// Lightweight health endpoint for uptime checks and deployment smoke tests.
const express_1 = require("express");
exports.healthRouter = (0, express_1.Router)();
exports.healthRouter.get('/', (_req, res) => {
    res.status(200).json({
        data: {
            service: 'zorvyn-finance-backend',
            status: 'ok',
            timestamp: new Date().toISOString(),
        },
    });
});
