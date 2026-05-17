/* eslint-disable no-undef */
import { envConfig } from "./src/config/env.config";
import { createApp } from "./src/app";
import prisma from "./src/lib/prisma";
import redisService from "./src/services/core/redis.service";
import { logInfo, logError, logDebug } from "./src/utils/logger";

const app = createApp();
const PORT = envConfig.PORT;

let server: ReturnType<typeof app.listen>;

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

async function connectDatabase(): Promise<void> {
  logDebug("⏳ Connecting to database...");
  try {
    await prisma.$connect();
    logDebug("✅ Database connection established.");
  } catch (error) {
    logError(error, "DatabaseConnection");
    process.exit(1);
  }
}

async function connectRedis(): Promise<void> {
  logDebug("⏳ Connecting to Redis...");
  await redisService.connect();
}

function startServer(): void {
  server = app.listen(PORT, () => {
    logInfo(`⚡ Server running in ${envConfig.NODE_ENV} mode on port ${PORT}`);
  });
}

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

function handleShutdown(signal: string): void {
  logDebug(`\n🛑 Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    logDebug("✅ HTTP server closed.");

    // Disconnect Prisma
    await prisma.$disconnect();
    logDebug("✅ Database connection closed.");

    // Disconnect Redis
    if (redisService.isConnected) {
      await redisService.closeClient();
      logDebug("✅ Redis connection closed.");
    }

    logDebug("👋 Process terminated.");
    process.exit(0);
  });

  // Force exit after 10 s if graceful shutdown stalls
  setTimeout(() => {
    logError(new Error("Graceful shutdown timed out. Forcing exit."), "Shutdown");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  logDebug("Initializing application...");
  await connectRedis();
  await connectDatabase();
  startServer();
  logDebug("Application initialization complete.");
}

main();
