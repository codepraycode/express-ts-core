import rateLimit from "express-rate-limit";
import { CorsOptions } from "cors";
import { envConfig } from "./env.config";

/**
 * Standard rate limiter — 100 req / 10 min per IP.
 * Apply to most API routes.
 */
export const limiter = rateLimit({
    max: 100,
    windowMs: 10 * 60 * 1_000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "fail",
        message: "Too many requests from this IP. Please try again in 10 minutes.",
    },
});

/**
 * Strict rate limiter — 10 req / 15 min per IP.
 * Apply to sensitive routes (auth, password reset, OTP).
 */
export const strictLimiter = rateLimit({
    max: 10,
    windowMs: 15 * 60 * 1_000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "fail",
        message: "Too many requests. Please try again later.",
    },
});

/**
 * CORS configuration.
 * Add production front-end origins to this list.
 */
export const corsOptions: CorsOptions = {
    origin: [
        envConfig.CLIENT_URL,
        "http://localhost:3000",
        "http://localhost:5173", // Vite default
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
};
