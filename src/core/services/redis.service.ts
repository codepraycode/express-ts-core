import { createClient, RedisClientType } from "redis";
import { logDebug, logError } from "../utils/logger";
import { envConfig } from "../../config/env.config";

/**
 * Singleton Redis client wrapper.
 *
 * Wraps the raw `redis` client with connection lifecycle management and
 * exposes typed helpers for common operations (get, set, del, scan).
 */
class RedisService {
    private client: RedisClientType;
    public isConnected: boolean = false;

    constructor() {
        this.client = createClient({
            url: envConfig.REDIS_URL,
            socket: { keepAlive: 60_000 },
        });

        this.client.on("error", (err) => logError(err, "RedisClient"));
        this.client.on("connect", () => logDebug("Redis client connecting..."));
        this.client.on("ready", () => {
            logDebug("✅ Redis client ready");
            this.isConnected = true;
        });
        this.client.on("end", () => {
            logDebug("Redis client disconnected");
            this.isConnected = false;
        });
    }

    public async connect(): Promise<void> {
        if (this.isConnected || this.client.isReady) {
            this.isConnected = true;
            return;
        }
        try {
            logDebug("Connecting to Redis...");
            await this.client.connect();
        } catch (error) {
            this.isConnected = false;
            logError(error, "RedisService.connect");
            throw new Error("Redis connection failed.");
        }
    }

    public async closeClient(): Promise<void> {
        if (this.client.isOpen) {
            await this.client.quit();
            logDebug("✅ Redis client disconnected");
        }
    }

    public getClient(): RedisClientType {
        return this.client;
    }

    // ---------------------------------------------------------------------------
    // Key-value helpers
    // ---------------------------------------------------------------------------

    public async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    public async set(
        key: string,
        value: string,
        options?: { EX?: number },
    ): Promise<string | null> {
        return this.client.set(key, value, options);
    }

    public async del(key: string): Promise<number> {
        return this.client.del(key);
    }

    /**
     * Delete all Redis keys matching a glob pattern.
     *
     * @param pattern - Redis SCAN MATCH pattern, e.g. `sess:*`
     * @returns Number of deleted keys
     */
    public async deleteSessions(pattern: string): Promise<number> {
        let count = 0;
        try {
            const iterator = this.client.scanIterator({ MATCH: pattern, COUNT: 100 });
            for await (const key of iterator) {
                await this.client.del(key);
                count++;
            }
        } catch (error) {
            logError(error, "RedisService.deleteSessions");
        }
        return count;
    }
}

const redisService = new RedisService();
export default redisService;
