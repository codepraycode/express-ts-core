import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client instance.
 *
 * In development, the client is attached to `globalThis` so that hot-reloads
 * (ts-node-dev) do not create multiple connections.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export default prisma;
