import prisma from "../../src/core/database/prisma";

/**
 * Truncate all public-schema tables in the test database.
 * Safe to call only in the "test" environment.
 */
export const clearDatabase = async (): Promise<void> => {
    if (process.env["NODE_ENV"] !== "test") {
        throw new Error("clearDatabase can only be called in the test environment!");
    }

    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;

    for (const { tablename } of tables) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE`);
    }
};

/**
 * Seed a Prisma model with test data.
 *
 * @example
 * await seedModel(prisma.user, [{ name: "Alice", email: "alice@test.com", ... }]);
 */
export const seedModel = async <T>(
    model: { createMany: (args: { data: T[] }) => Promise<unknown> },
    data: T[],
): Promise<void> => {
    await model.createMany({ data });
};
