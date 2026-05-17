import express, { Express } from "express";
import path from "path";
import { BASE_MIDDLEWARES } from "./middlewares/core.middleware";
import { registerRoutes } from "./routes/index";
import { logErrorMiddleware, returnError, unknownRoute } from "./middlewares/error.middleware";
import { logDebug } from "./core/utils/logger";
import { envConfig } from "./config/env.config";

/**
 * Application factory.
 *
 * Returns a fully configured Express instance without starting an HTTP server.
 * This pattern makes it trivial to import in tests without side-effects.
 */
export function createApp(): Express {
    const app: Express = express();

    // Trust proxy headers (required behind Nginx / load balancers)
    app.set("trust proxy", 1);

    // Core middlewares (CORS, body parsers, Morgan request logger)
    logDebug("⚙️ Registering core middlewares...");
    app.use(BASE_MIDDLEWARES);

    // Serve uploads directory in development
    if (envConfig.NODE_ENV === "development") {
        const uploadsPath = path.join(__dirname, "..", "uploads");
        app.use("/uploads", express.static(uploadsPath));
        logDebug(`📁 Serving uploads from: ${uploadsPath}`);
    }

    // Routes
    logDebug("🛣️ Registering routes...");
    registerRoutes(app);

    // Error handlers — MUST come last
    app.use("*", unknownRoute);
    app.use(logErrorMiddleware);
    app.use(returnError);

    return app;
}
