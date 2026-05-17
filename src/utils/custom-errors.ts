// error-classes.ts
import { BaseError } from "./error";
import { httpStatusCodes } from "./http-status-codes";

export class BadRequestError extends BaseError {
	constructor(message: string, metadata: any = null) {
		super(message, httpStatusCodes.BAD_REQUEST, "BadRequestError", metadata);
	}
}

export class UnauthorizedError extends BaseError {
	constructor(message: string, metadata: any = null) {
		super(message, httpStatusCodes.UNAUTHORIZED, "UnauthorizedError", metadata);
	}
}

export class ForbiddenError extends BaseError {
	constructor(message: string, metadata: any = null) {
		super(message, httpStatusCodes.FORBIDDEN, "ForbiddenError", metadata);
	}
}

export class NotFoundError extends BaseError {
	constructor(message: string, metadata: any = null) {
		super(message, httpStatusCodes.NOT_FOUND, "NotFoundError", metadata);
	}
}

export class ConflictError extends BaseError {
	constructor(message: string, metadata: any = null) {
		super(message, httpStatusCodes.CONFLICT, "ConflictError", metadata);
	}
}

export class UnprocessableEntityError extends BaseError {
	constructor(message: string, metadata: any = null) {
		super(message, httpStatusCodes.UNPROCESSABLE_ENTITY, "UnprocessableEntityError", metadata);
	}
}

export class InternalServerError extends BaseError {
	constructor(message: string, metadata: any = null) {
		super(message, httpStatusCodes.INTERNAL_SERVER_ERROR, "InternalServerError", metadata);
	}
}

// Added for your email timeout issue
export class GatewayTimeoutError extends BaseError {
	constructor(message: string, metadata: any = null) {
		super(message, httpStatusCodes.GATEWAY_TIMEOUT, "GatewayTimeoutError", metadata);
	}
}

export class ServiceUnavailableError extends BaseError {
	constructor(message: string, metadata: any = null) {
		super(message, httpStatusCodes.SERVICE_UNAVAILABLE, "ServiceUnavailableError", metadata);
	}
}
