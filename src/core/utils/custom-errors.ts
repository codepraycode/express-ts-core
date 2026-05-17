/**
 * Base application error.
 *
 * Extend this class for all domain-specific errors.
 * `isOperational = true` signals that the error is expected and should be
 * responded to gracefully (not crash the process).
 */
export class BaseError extends Error {
    public readonly name: string;
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly metadata: unknown;

    constructor(
        message: string,
        statusCode: number,
        name = "BaseError",
        metadata: unknown = null,
        isOperational = true,
    ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.metadata = metadata;
    }
}

// ---------------------------------------------------------------------------
// HTTP-specific error classes
// ---------------------------------------------------------------------------

import { httpStatusCodes } from "../utils/http-status-codes";

export class BadRequestError extends BaseError {
    constructor(message: string, metadata?: unknown) {
        super(message, httpStatusCodes.BAD_REQUEST, "BadRequestError", metadata);
    }
}

export class UnauthorizedError extends BaseError {
    constructor(message: string, metadata?: unknown) {
        super(message, httpStatusCodes.UNAUTHORIZED, "UnauthorizedError", metadata);
    }
}

export class ForbiddenError extends BaseError {
    constructor(message: string, metadata?: unknown) {
        super(message, httpStatusCodes.FORBIDDEN, "ForbiddenError", metadata);
    }
}

export class NotFoundError extends BaseError {
    constructor(message: string, metadata?: unknown) {
        super(message, httpStatusCodes.NOT_FOUND, "NotFoundError", metadata);
    }
}

export class ConflictError extends BaseError {
    constructor(message: string, metadata?: unknown) {
        super(message, httpStatusCodes.CONFLICT, "ConflictError", metadata);
    }
}

export class UnprocessableEntityError extends BaseError {
    constructor(message: string, metadata?: unknown) {
        super(message, httpStatusCodes.UNPROCESSABLE_ENTITY, "UnprocessableEntityError", metadata);
    }
}

export class InternalServerError extends BaseError {
    constructor(message: string, metadata?: unknown) {
        super(message, httpStatusCodes.INTERNAL_SERVER_ERROR, "InternalServerError", metadata);
    }
}

export class GatewayTimeoutError extends BaseError {
    constructor(message: string, metadata?: unknown) {
        super(message, httpStatusCodes.GATEWAY_TIMEOUT, "GatewayTimeoutError", metadata);
    }
}

export class ServiceUnavailableError extends BaseError {
    constructor(message: string, metadata?: unknown) {
        super(message, httpStatusCodes.SERVICE_UNAVAILABLE, "ServiceUnavailableError", metadata);
    }
}
