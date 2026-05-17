import { Response } from "express";

type SuccessPayload<T = unknown> = { data?: T; message?: string; meta?: unknown };
type ErrorPayload = { error?: unknown; message: string; status: number };

/**
 * Standardised API response envelope.
 *
 * Shape:
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

  // ---------------------------------------------------------------------------
  // Factory helpers
  // ---------------------------------------------------------------------------

  /** 200 OK */
  static ok<T = unknown>(res: Response, payload: SuccessPayload<T>): Response {
    const { message = "Success", data, meta } = payload;
    return res.status(200).json(new ApiResponse(200, message, data, meta));
  }

  /** 201 Created */
  static created<T = unknown>(res: Response, payload: SuccessPayload<T>): Response {
    const { message = "Created", data, meta } = payload;
    return res.status(201).json(new ApiResponse(201, message, data, meta));
  }

  /** 204 No Content */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /** 4xx / 5xx Error */
  static error(
    res: Response,
    { status = 500, message = "Internal Server Error", error }: ErrorPayload
  ): Response {
    return res.status(status).json(new ApiResponse(status, message, error));
  }
}
