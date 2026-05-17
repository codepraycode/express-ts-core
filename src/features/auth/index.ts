/**
 * Auth feature — barrel export (the Gatekeeper).
 *
 * External modules should import from this index rather than reaching
 * into internal files. This enforces encapsulation and makes refactoring easier.
 *
 * @example
 * import { authService, authenticate, type RegisterDto } from '../auth';
 */

// Public API surface
export { authController } from "./auth.controller";
export { authService } from "./auth.service";
export { authRepository } from "./auth.repository";
export { authenticate, authorize } from "./auth.middleware";
export type { RegisterDto, LoginDto, JwtUserPayload } from "./auth.types";

// Default: the Express router
export { default } from "./auth.routes";
