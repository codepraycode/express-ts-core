import prisma from "../../core/database/prisma";
import { AuthUtils } from "./auth.utils";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../core/utils/custom-errors";
import { LoginDto, RegisterDto } from "./auth.types";

/**
 * Data-access layer for auth operations.
 * Raw Prisma queries are isolated here; services call this repository.
 */
export class AuthRepository {
    /** Create a new user with a hashed password. */
    async createUser(dto: RegisterDto) {
        const existing = await prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) throw new ConflictError("A user with this email already exists.");

        const hashedPassword = await AuthUtils.hashPassword(dto.password);

        return prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email.toLowerCase().trim(),
                password: hashedPassword,
            },
            omit: { password: true },
        });
    }

    /** Validate credentials and return the safe user record. */
    async validateCredentials(dto: LoginDto) {
        const user = await prisma.user.findUnique({
            where: { email: dto.email.toLowerCase().trim() },
        });
        if (!user) throw new UnauthorizedError("Invalid email or password.");

        const isMatch = await AuthUtils.comparePassword(dto.password, user.password);
        if (!isMatch) throw new UnauthorizedError("Invalid email or password.");

        const { password: _pwd, ...safeUser } = user;
        return safeUser;
    }

    /** Find a user by ID — used in the JWT guard's /me endpoint. */
    async findById(id: string) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundError("User not found.");

        const { password: _pwd, ...safeUser } = user;
        return safeUser;
    }
}

export const authRepository = new AuthRepository();
