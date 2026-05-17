import { Request, Response, NextFunction } from "express";
import { logRequest, logError } from "../core/utils/logger";

/**
 * Logs every HTTP request with method, URL, status code and response time.
 *
 * @example
 * app.use(requestLogger);
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    res.on("finish", () => logRequest(req.method, req.url, res.statusCode, Date.now() - start));
    next();
};

/**
 * Error logging middleware.
 * Place after all routes so it catches forwarded errors.
 *
 * @example
 * app.use(errorLogger);
 */
export const errorLogger = (err: Error, req: Request, _res: Response, next: NextFunction): void => {
    logError(err, `${req.method} ${req.url}`);
    next(err);
};
