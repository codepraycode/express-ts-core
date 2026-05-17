import "express-session";

/**
 * Augment express-session's SessionData.
 * Add server-side session properties here as your app grows.
 *
 * @example
 * req.session.returnTo = "/dashboard";
 */
declare module "express-session" {
    interface SessionData {
        /** Store the URL to redirect to after login. */
        returnTo?: string;
    }
}
