import { SessionOptions, CookieOptions } from "express-session";
import RedisStore from "connect-redis";
import redisService from "../core/services/redis.service";
import { envConfig } from "./env.config";

const isProduction = envConfig.NODE_ENV === "production";

/**
 * Cookie settings shared across all session stores.
 * Tightened in production (secure, sameSite: "none").
 */
const baseCookie: CookieOptions = {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
};

/**
 * Main application session — 12 hours.
 *
 * Uses Redis as the session store so sessions survive server restarts.
 */
export const sessionConfig: SessionOptions = {
    store: new RedisStore({
        client: redisService.getClient() as never,
        prefix: "sess:",
    }),
    secret: envConfig.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { ...baseCookie, maxAge: 1_000 * 60 * 60 * 12 },
    name: "sid",
};
