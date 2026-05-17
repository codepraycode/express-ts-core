import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate, authorize } from "../auth/auth.middleware";

const router = Router();

/**
 * @route   GET /api/v1/users
 * @desc    List all users
 * @access  Admin
 */
router.get("/", authenticate, authorize("ADMIN"), userController.getAll.bind(userController));

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get a specific user by ID
 * @access  Authenticated
 */
router.get("/:id", authenticate, userController.getById.bind(userController));

/**
 * @route   PATCH /api/v1/users/:id
 * @desc    Update user profile
 * @access  Authenticated
 */
router.patch("/:id", authenticate, userController.update.bind(userController));

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete a user permanently
 * @access  Admin
 */
router.delete("/:id", authenticate, authorize("ADMIN"), userController.delete.bind(userController));

export default router;
