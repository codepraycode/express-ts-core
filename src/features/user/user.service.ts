import { userRepository } from "./user.repository";
import { NotFoundError } from "../../core/utils/custom-errors";
import { SafeUser, UpdateUserDto } from "./user.types";

/**
 * Business-logic layer for User management.
 * All DB access delegates to {@link UserRepository}.
 */
export class UserService {
    /** Get a user by ID — throws {@link NotFoundError} if absent. */
    async getById(id: string): Promise<SafeUser> {
        const user = await userRepository.findById(id);
        if (!user) throw new NotFoundError("User not found.");
        return user;
    }

    /** Return all users. */
    async getAll(): Promise<SafeUser[]> {
        return userRepository.findAll();
    }

    /** Update a user's profile fields. */
    async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
        await this.getById(id); // ensure the user exists first
        return userRepository.update(id, dto);
    }

    /** Soft-delete (deactivate) a user account. */
    async deactivate(id: string): Promise<SafeUser> {
        await this.getById(id);
        return userRepository.deactivate(id);
    }

    /** Permanently delete a user. */
    async delete(id: string): Promise<void> {
        await this.getById(id);
        return userRepository.delete(id);
    }
}

export const userService = new UserService();
