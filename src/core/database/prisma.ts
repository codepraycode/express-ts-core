import { PrismaClient } from "@prisma/client";
import { envConfig } from "../../config/env.config";

/**
 * Singleton Prisma client.
 *
 * In development, the instance is stored on `globalThis` so hot-reloads
 * (ts-node-dev) do not exhaust the connection pool.
 */
declare global {
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
    global.__prisma ??
    new PrismaClient({
        log:
            envConfig.NODE_ENV === "development"
                ? ["query", "warn", "error"]
                : ["warn", "error"],
    });

if (envConfig.NODE_ENV !== "production") {
    global.__prisma = prisma;
}

export default prisma;
