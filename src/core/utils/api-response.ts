import { Response } from "express";
import { httpStatusCodes } from "./http-status-codes";

type SuccessPayload<T = unknown> = { data?: T; message?: string; meta?: unknown };
type ErrorPayload = { error?: unknown; message: string; status: number };

/**
 * Standardised JSON response envelope.
 *
 * ```json
 * { "success": true, "status": 200, "message": "...", "data": { ... } }
 * ```
 */
export class ApiResponse<T = unknown> {
    public readonly success: boolean;
    public readonly status: number;
    public readonly message: string;
    public readonly data?: T;
    public readonly meta?: unknown;

    constructor(status: number, message: string, data?: T, meta?: unknown) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.meta = meta;
        this.success = status >= 200 && status < 300;
    }

    /** 200 OK */
    static ok<T = unknown>(res: Response, payload: SuccessPayload<T>): Response {
        const { message = "Success", data, meta } = payload;
        return res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, message, data, meta));
    }

    /** 201 Created */
    static created<T = unknown>(res: Response, payload: SuccessPayload<T>): Response {
        const { message = "Created", data, meta } = payload;
        return res
            .status(httpStatusCodes.CREATED)
            .json(new ApiResponse(httpStatusCodes.CREATED, message, data, meta));
    }

    /** 204 No Content */
    static noContent(res: Response): Response {
        return res.status(httpStatusCodes.NO_CONTENT).send();
    }

    /** 4xx / 5xx error */
    static error(
        res: Response,
        { status = httpStatusCodes.INTERNAL_SERVER_ERROR, message = "Internal Server Error", error }: ErrorPayload,
    ): Response {
        return res.status(status).json(new ApiResponse(status, message, error));
    }
}
