"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const globalErrorHandler = (err, req, res, next) => {
    console.error(err.statusCode || 500);
    res.status(err.statusCode || 500).json({
        massage: err.message || "internal server error",
        cause: err.cause,
        stack: err.stack,
        error: err
    });
};
exports.globalErrorHandler = globalErrorHandler;
