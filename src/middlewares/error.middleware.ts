import { NextFunction, Request, Response } from "express";
import { BaseError } from "../core/utils/custom-errors";
import { httpStatusCodes } from "../core/utils/http-status-codes";
import logger from "../core/utils/logger";
import { envConfig } from "../config/env.config";
import { ApiResponse } from "../core/utils/api-response";
import { NotFoundError } from "../core/utils/custom-errors";

type AppError = Error | BaseError;

function logErr(err: AppError): void {
    if (err instanceof BaseError) {
        logger.error(`[Operational] ${err.name}: ${err.message} (${err.statusCode})`);
    } else {
        logger.error(`[Critical] ${err.name}: ${err.message}`, err.stack);
    }
}

// ---------------------------------------------------------------------------
// Middleware 1 — log then forward
// ---------------------------------------------------------------------------

export function logErrorMiddleware(
    err: AppError,
    _req: Request,
    _res: Response,
    next: NextFunction,
): void {
    logErr(err);
    next(err);
}

// ---------------------------------------------------------------------------
// Middleware 2 — structured JSON error response
// ---------------------------------------------------------------------------

export function returnError(err: AppError, _req: Request, res: Response, next: NextFunction): void {
    if (res.headersSent) return next(err);

    let statusCode: number = httpStatusCodes.INTERNAL_SERVER_ERROR;
    let message = "An unexpected error occurred.";
    let errorName: string | undefined;

    if (err instanceof BaseError) {
        statusCode = err.statusCode;
        message = err.message;
        errorName = err.name;
    } else if (err instanceof Error) {
        // Handle Prisma constraint errors
        if (err.constructor.name === "PrismaClientKnownRequestError") {
            statusCode = httpStatusCodes.CONFLICT;
            message = "A database constraint was violated.";
            errorName = "DatabaseConstraintError";
        } else if (err.constructor.name === "PrismaClientValidationError") {
            statusCode = httpStatusCodes.BAD_REQUEST;
            message = "Invalid data supplied to the database.";
            errorName = "DatabaseValidationError";
        }
    }

    ApiResponse.error(res, {
        message,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: statusCode as any,
        error: envConfig.NODE_ENV === "development" ? new Error(errorName) : undefined,
    });
}

// ---------------------------------------------------------------------------
// 404 handler — register after all routes
// ---------------------------------------------------------------------------

export function unknownRoute(_req: Request, _res: Response, next: NextFunction): void {
    next(new NotFoundError("Route not found. Check the URL and try again."));
}
