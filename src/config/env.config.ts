/* eslint-disable no-undef */
import dotenv from "dotenv";
import path from "path";

// ---------------------------------------------------------------------------
// Load .env file — must happen before any other import reads process.env
// ---------------------------------------------------------------------------

const loadEnv = (): void => {
    const env = process.env["NODE_ENV"] ?? "development";
    const specific = path.resolve(process.cwd(), `.env.${env}`);
    const generic = path.resolve(process.cwd(), `.env`);

    const result = dotenv.config({ path: specific });

    if (result.error && (result.error as NodeJS.ErrnoException).code === "ENOENT") {
        console.warn(`[env] ${specific} not found — falling back to .env`);
        dotenv.config({ path: generic });
    } else if (result.error) {
        console.error(`[env] Error loading ${specific}:`, result.error.message);
    }
};

loadEnv();

// ---------------------------------------------------------------------------
// Typed config object
// ---------------------------------------------------------------------------

interface EnvConfig {
    NODE_ENV: string;
    PORT: number;
    CLIENT_URL: string;

    /** Prisma reads DATABASE_URL directly; this is for reference / validation */
    DATABASE_URL: string;

    REDIS_URL: string;

    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    SESSION_SECRET: string;

    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_USER: string;
    SMTP_PASSWORD: string;
    FROM_EMAIL: string;
    EMAIL_TIMEOUT: number;

    ENABLE_FILE_LOGGING: boolean;
    API_PREFIX: string;
}

const getEnv = (key: string, fallback?: string): string => {
    const value = process.env[key];
    if (value === undefined) {
        if (fallback !== undefined) return fallback;
        throw new Error(`[env] Missing required environment variable: "${key}"`);
    }
    return value;
};

export const envConfig: EnvConfig = {
    NODE_ENV: getEnv("NODE_ENV", "development"),
    PORT: parseInt(getEnv("PORT", "8080"), 10),
    CLIENT_URL: getEnv("CLIENT_URL", "http://localhost:3000"),

    DATABASE_URL: getEnv("DATABASE_URL", "postgresql://root:password@localhost:5432/app_db"),

    REDIS_URL: getEnv("REDIS_URL", "redis://localhost:6379"),

    JWT_SECRET: getEnv("JWT_SECRET"),
    JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "1h"),
    SESSION_SECRET: getEnv("SESSION_SECRET"),

    SMTP_HOST: getEnv("SMTP_HOST", ""),
    SMTP_PORT: parseInt(getEnv("SMTP_PORT", "587"), 10),
    SMTP_USER: getEnv("SMTP_USER", ""),
    SMTP_PASSWORD: getEnv("SMTP_PASSWORD", ""),
    FROM_EMAIL: getEnv("FROM_EMAIL", "no-reply@example.com"),
    EMAIL_TIMEOUT: parseInt(getEnv("EMAIL_TIMEOUT", "10000"), 10),

    ENABLE_FILE_LOGGING: getEnv("ENABLE_FILE_LOGGING", "false") === "true",
    API_PREFIX: getEnv("API_PREFIX", "api/v1"),
};

// ---------------------------------------------------------------------------
// Startup validation
// ---------------------------------------------------------------------------

export const validateEnv = (): void => {
    const required: (keyof EnvConfig)[] = ["JWT_SECRET", "SESSION_SECRET", "DATABASE_URL"];
    const missing = required.filter((k) => !process.env[k]);

    if (missing.length > 0) {
        throw new Error(
            `[env] Missing required environment variables: ${missing.join(", ")}. Check your .env file.`,
        );
    }
};

validateEnv();
