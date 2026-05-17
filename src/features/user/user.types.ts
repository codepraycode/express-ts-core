import { User } from "@prisma/client";

/** Public-facing user shape — password stripped. */
export type SafeUser = Omit<User, "password">;

/** Allowed update fields. */
export interface UpdateUserDto {
    name?: string;
    email?: string;
}
