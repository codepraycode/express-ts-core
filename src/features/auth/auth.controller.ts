import { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service";
import { ApiResponse } from "../../core/utils/api-response";

/**
 * HTTP layer for Auth routes.
 * Validates input shape, delegates to {@link AuthService}, returns shaped responses.
 */
export class AuthController {
    /**
     * POST /api/v1/auth/register
     * @access Public
     */
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { user, token } = await authService.register(req.body);
            ApiResponse.created(res, { message: "Account created successfully.", data: { user, token } });
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/v1/auth/login
     * @access Public
     */
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { user, token } = await authService.login(req.body);
            ApiResponse.ok(res, { message: "Login successful.", data: { user, token } });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/v1/auth/me
     * @access Private (requires authenticate middleware)
     */
    async me(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await authService.me(req.user!.id);
            ApiResponse.ok(res, { message: "Profile retrieved.", data: user });
        } catch (err) {
            next(err);
        }
    }
}

export const authController = new AuthController();
