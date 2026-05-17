import morgan, { StreamOptions } from "morgan";
import chalk from "chalk";
import logger from "../core/utils/logger";

// Pipe Morgan output through Winston
const stream: StreamOptions = {
    write: (message) => logger.http(message.trim()),
};

const truncate = (str: string, len = 20): string =>
    str.length <= len ? str : str.substring(0, len) + "...";

// Auth-header summary token
morgan.token("auth-headers", (req: any) => {
    const parts: string[] = [];

    if (req.headers["authorization"]) {
        const auth = req.headers["authorization"] as string;
        const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : auth;
        parts.push(`${chalk.bold("Auth:")} ${truncate(token!, 15)}`);
    }

    return parts.length > 0 ? `| ${parts.join(" | ")}` : "";
});

// Coloured status code
morgan.token("status-colored", (_req, res) => {
    const s = res.statusCode;
    const color =
        s >= 500
            ? chalk.red
            : s >= 400
              ? chalk.yellow
              : s >= 300
                ? chalk.cyan
                : s >= 200
                  ? chalk.green
                  : chalk.white;
    return color(s.toString());
});

// Coloured HTTP method
morgan.token("method-colored", (req) => {
    const m = req.method ?? "";
    const color =
        m === "GET"
            ? chalk.green
            : m === "POST"
              ? chalk.yellow
              : m === "PUT"
                ? chalk.blue
                : m === "DELETE"
                  ? chalk.red
                  : chalk.white;
    return color(m);
});

const morganMiddleware = morgan(
    ":method-colored :url :status-colored :res[content-length] - :response-time ms :auth-headers",
    { stream },
);

export default morganMiddleware;
