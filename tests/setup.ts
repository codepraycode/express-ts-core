import path from "path";
import dotenv from "dotenv";
import prisma from "../src/core/database/prisma";
import redisService from "../src/core/services/redis.service";
import logger from "../src/core/utils/logger";

dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

jest.setTimeout(30_000);

beforeAll(async () => {
    if (process.env["NODE_ENV"] !== "test") {
        logger.warn('WARNING: NODE_ENV is not "test". This may affect your database.');
    }
});

afterAll(async () => {
    try {
        await prisma.$disconnect();
    } catch (e) {
        logger.error("Error disconnecting Prisma:", e);
    }

    try {
        if (redisService.isConnected) await redisService.closeClient();
    } catch (e) {
        logger.error("Error disconnecting Redis:", e);
    }
});
