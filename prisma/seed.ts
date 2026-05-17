import prisma from "../src/core/database/prisma";
import { AuthUtils } from "../src/features/auth/auth.utils";

/**
 * Database seed script.
 *
 * Run with: pnpm db:seed
 *
 * Creates a default admin account for first-time setup.
 * Change the password immediately in production!
 */
async function main() {
    console.log("🌱 Seeding database...");

    const adminEmail = "admin@example.com";
    const adminPassword = "Password123!";
    const hashedPassword = await AuthUtils.hashPassword(adminPassword);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            name: "Admin User",
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN",
        },
    });

    console.log(`✅ Admin user ready: ${admin.email}`);
    console.log(`   Password: ${adminPassword}  ← change this immediately in production!`);
}

main()
    .then(() => {
        console.log("✅ Seed complete.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Seed failed:", err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
