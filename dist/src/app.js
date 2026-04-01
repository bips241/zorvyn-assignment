"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
// Main Express app composition. I kept route registration centralized here so reviewers can see the API surface quickly.
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const openapi_1 = require("./docs/openapi");
const auth_routes_1 = require("./modules/auth/auth.routes");
const dashboard_routes_1 = require("./modules/dashboard/dashboard.routes");
const health_routes_1 = require("./modules/health/health.routes");
const records_routes_1 = require("./modules/records/records.routes");
const users_routes_1 = require("./modules/users/users.routes");
const global_error_handler_1 = require("./shared/middleware/global-error-handler");
const not_found_handler_1 = require("./shared/middleware/not-found-handler");
const createApp = () => {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)());
    app.use((0, morgan_1.default)('dev'));
    app.use(express_1.default.json());
    app.use('/api/v1/health', health_routes_1.healthRouter);
    app.use('/api/v1/auth', auth_routes_1.authRouter);
    app.use('/api/v1/users', users_routes_1.usersRouter);
    app.use('/api/v1/records', records_routes_1.recordsRouter);
    app.use('/api/v1/dashboard', dashboard_routes_1.dashboardRouter);
    // I expose both UI and raw JSON so this works for human review and tooling (Postman/importers/CI checks).
    app.get('/api-docs.json', (_req, res) => {
        res.status(200).json(openapi_1.openApiSpec);
    });
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openapi_1.openApiSpec));
    app.use(not_found_handler_1.notFoundHandler);
    app.use(global_error_handler_1.globalErrorHandler);
    return app;
};
exports.createApp = createApp;
