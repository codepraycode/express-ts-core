import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { corsOptions } from "../config/security.config";
import morganMiddleware from "./morgan.middleware";

/**
 * Ordered array of global Express middlewares.
 *
 * Apply with `app.use(BASE_MIDDLEWARES)` before registering any routes.
 * Order matters:
 *   1. HTTP request logger (Morgan)
 *   2. CORS — must come before body parsers
 *   3. Body / cookie parsers
 */
export const BASE_MIDDLEWARES = [
    morganMiddleware,
    cors(corsOptions),
    cookieParser(),
    express.json(),
    express.urlencoded({ extended: true }),
];
