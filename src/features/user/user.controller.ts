import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import { ApiResponse } from "../../core/utils/api-response";

/**
 * HTTP layer for User routes.
 */
export class UserController {
    /**
     * GET /api/v1/users
     * @access Admin
     */
    async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const users = await userService.getAll();
            ApiResponse.ok(res, { message: "Users retrieved successfully.", data: users });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/v1/users/:id
     * @access Authenticated
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await userService.getById(req.params["id"]!);
            ApiResponse.ok(res, { message: "User retrieved successfully.", data: user });
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/v1/users/:id
     * @access Authenticated
     */
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await userService.update(req.params["id"]!, req.body);
            ApiResponse.ok(res, { message: "User updated successfully.", data: user });
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/v1/users/:id
     * @access Admin
     */
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await userService.delete(req.params["id"]!);
            ApiResponse.noContent(res);
        } catch (err) {
            next(err);
        }
    }
}

export const userController = new UserController();
