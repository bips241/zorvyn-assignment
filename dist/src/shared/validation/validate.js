"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const http_error_1 = require("../http/http-error");
const validate = (schema) => {
    return (req, _res, next) => {
        try {
            schema.parse({
                body: req.body,
                params: req.params,
                query: req.query,
            });
            return next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return next(new http_error_1.HttpError(400, 'VALIDATION_ERROR', 'Invalid request input', error.issues));
            }
            return next(error);
        }
    };
};
exports.validate = validate;
