import { JwtUserPayload } from "../features/auth/auth.types";

/**
 * Augment Express's Request to carry the authenticated user payload.
 * Populated by the `authenticate` middleware in features/auth/auth.middleware.ts.
 */
declare global {
    namespace Express {
        interface Request {
            user?: JwtUserPayload;
        }
    }
}
