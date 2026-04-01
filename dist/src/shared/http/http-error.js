"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
// Uniform application error object so handlers can map failures to consistent HTTP responses.
class HttpError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, code, message, details) {
        super(message);
        this.name = 'HttpError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}
exports.HttpError = HttpError;
