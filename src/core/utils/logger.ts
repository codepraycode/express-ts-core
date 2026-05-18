import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import util from "util";

// ---------------------------------------------------------------------------
// Bootstrap constants — read from process.env directly (logger is a
// low-level utility that initialises before envConfig is fully loaded).
// ---------------------------------------------------------------------------

const LOG_DIR = path.join(process.cwd(), "logs");
const IS_PROD = process.env["NODE_ENV"] === "production";
const ENABLE_FILE_LOGGING = IS_PROD || process.env["ENABLE_FILE_LOGGING"] === "true";
const LOG_LEVEL = process.env["LOG_LEVEL"] ?? (IS_PROD ? "info" : "debug");

// ---------------------------------------------------------------------------
// Log levels & colours
// ---------------------------------------------------------------------------

const logLevels = {
    levels: { error: 0, warn: 1, info: 2, http: 3, debug: 4 },
    colors: { error: "red", warn: "yellow", info: "green", http: "magenta", debug: "blue" },
};

winston.addColors(logLevels.colors);

// ---------------------------------------------------------------------------
// Formats
// ---------------------------------------------------------------------------

const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;
        let metaStr = "";

        if (Object.keys(meta).length > 0) {
            if (meta["stack"]) {
                metaStr = `\n${meta["stack"]}`;
            } else {
                const clean = Object.fromEntries(
                    Object.entries(meta).filter(
                        ([k]) => ![Symbol.for("level"), Symbol.for("message")].includes(k as never),
                    ),
                );
                if (Object.keys(clean).length > 0) {
                    metaStr = `\n${util.inspect(clean, { colors: true, depth: null, breakLength: 80 })}`;
                }
            }
        }

        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    }),
);

const jsonFileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

// ---------------------------------------------------------------------------
// Transports
// ---------------------------------------------------------------------------

const transports: winston.transport[] = [
    new winston.transports.Console({ format: consoleFormat, level: LOG_LEVEL }),
];

if (ENABLE_FILE_LOGGING) {
    transports.push(
        new DailyRotateFile({
            filename: path.join(LOG_DIR, "error-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            level: "error",
            format: jsonFileFormat,
            maxSize: "20m",
            maxFiles: "14d",
            zippedArchive: true,
            handleExceptions: true,
        }),
        new DailyRotateFile({
            filename: path.join(LOG_DIR, "combined-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            format: jsonFileFormat,
            maxSize: "20m",
            maxFiles: "14d",
            zippedArchive: true,
        }),
    );
}

// ---------------------------------------------------------------------------
// Logger instance
// ---------------------------------------------------------------------------

const logger = winston.createLogger({
    level: LOG_LEVEL,
    levels: logLevels.levels,
    transports,
    exitOnError: false,
});

// ---------------------------------------------------------------------------
// Named helpers
// ---------------------------------------------------------------------------

/** Log an error with optional context and metadata. */
export const logError = (
    error: Error | unknown,
    context?: string,
    meta: Record<string, unknown> = {},
) => {
    const prefix = context ? `[${context}] ` : "";
    if (error instanceof Error) {
        logger.error(`${prefix}${error.message}`, { ...meta, stack: error.stack, error });
    } else {
        logger.error(`${prefix}${String(error)}`, meta);
    }
};

/** Log an informational message. */
export const logInfo = (message: string, meta?: Record<string, unknown>) =>
    logger.info(message, meta);

/** Log a warning. */
export const logWarn = (message: string, meta?: Record<string, unknown>) =>
    logger.warn(message, meta);

/** Log a debug message. */
export const logDebug = (message: string, meta?: Record<string, unknown>) =>
    logger.debug(message, meta);

/** Log an HTTP request. */
export const logRequest = (method: string, url: string, statusCode?: number, duration?: number) => {
    const msg = `${method} ${url}${statusCode ? ` - ${statusCode}` : ""}${duration ? ` (${duration}ms)` : ""}`;
    logger.http(msg);
};

export default logger;
