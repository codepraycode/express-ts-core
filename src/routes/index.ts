import { Express, Router } from "express";
import session from "express-session";
import { sessionConfig } from "../config/session.config";
import { limiter, strictLimiter } from "../config/security.config";
import { logDebug } from "../core/utils/logger";
import { envConfig } from "../config/env.config";

// Feature routers — import via barrel index
import authRoutes from "../features/auth";
import userRoutes from "../features/user";

const API_PREFIX = `/${envConfig.API_PREFIX}`;

/**
 * Register all application routes.
 *
 * ─────────────────────────────────────────────────────
 * How to add a new feature:
 *   1. Create `src/features/<name>/` with the standard files
 *   2. Add a barrel `src/features/<name>/index.ts`
 *   3. Import the default router export here and mount it
 * ─────────────────────────────────────────────────────
 */
export function registerRoutes(app: Express): void {
    // Health / status — no auth, no rate limit
    app.get("/", (_req, res) =>
        res.json({ status: "ok", environment: envConfig.NODE_ENV }),
    );
    app.get("/health", (_req, res) =>
        res.json({ status: "healthy", timestamp: new Date().toISOString() }),
    );

    // -----------------------------------------------------------------------
    // Auth — /api/v1/auth
    // -----------------------------------------------------------------------
    logDebug("Registering auth routes...");
    const authRouter = Router();
    authRouter.use("/auth", strictLimiter, authRoutes);
    app.use(API_PREFIX, session(sessionConfig), authRouter);

    // -----------------------------------------------------------------------
    // Users — /api/v1/users
    // -----------------------------------------------------------------------
    logDebug("Registering user routes...");
    const userRouter = Router();
    userRouter.use("/users", limiter, userRoutes);
    app.use(API_PREFIX, session(sessionConfig), userRouter);

    logDebug("✅ All routes registered");
}
