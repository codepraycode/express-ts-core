/**
 * User feature — barrel export (the Gatekeeper).
 *
 * @example
 * import { userService, type SafeUser } from '../user';
 */

export { userController } from "./user.controller";
export { userService } from "./user.service";
export { userRepository } from "./user.repository";
export type { SafeUser, UpdateUserDto } from "./user.types";

// Default: the Express router
export { default } from "./user.routes";
