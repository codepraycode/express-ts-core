import prisma from "../../core/database/prisma";
import { SafeUser } from "./user.types";

/**
 * Data-access layer for the User entity.
 * All Prisma queries for users live here.
 */
export class UserRepository {
    /** Find a user by ID, password excluded. */
    async findById(id: string): Promise<SafeUser | null> {
        return prisma.user.findUnique({ where: { id }, omit: { password: true } });
    }

    /** Find a user by email (includes password hash — for auth only). */
    async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }

    /** Return all users, ordered by creation date descending. */
    async findAll(): Promise<SafeUser[]> {
        return prisma.user.findMany({
            omit: { password: true },
            orderBy: { createdAt: "desc" },
        });
    }

    /** Update mutable fields on a user record. */
    async update(id: string, data: Partial<{ name: string; email: string }>): Promise<SafeUser> {
        return prisma.user.update({ where: { id }, data, omit: { password: true } });
    }

    /** Soft-delete: marks the account inactive without removing the row. */
    async deactivate(id: string): Promise<SafeUser> {
        return prisma.user.update({
            where: { id },
            data: { isActive: false },
            omit: { password: true },
        });
    }

    /** Permanently delete a user. */
    async delete(id: string): Promise<void> {
        await prisma.user.delete({ where: { id } });
    }
}

export const userRepository = new UserRepository();
