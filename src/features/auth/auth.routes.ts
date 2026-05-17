import { Router } from "express";
import { authController } from "./auth.controller";
import { authenticate } from "./auth.middleware";

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Create a new user account
 * @access  Public
 */
router.post("/register", authController.register.bind(authController));

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate and receive a JWT
 * @access  Public
 */
router.post("/login", authController.login.bind(authController));

/**
 * @route   GET /api/v1/auth/me
 * @desc    Return the currently authenticated user
 * @access  Private
 */
router.get("/me", authenticate, authController.me.bind(authController));

export default router;
