import { createClient, RedisClientType } from "redis";
import { logDebug, logError } from "../../utils/logger";

class RedisService {
	private client: RedisClientType;
	public isConnected: boolean = false;

	constructor() {
		const url = process.env.REDIS_URL?.startsWith("redis")
			? process.env.REDIS_URL
			: `redis://${process.env.REDIS_URL || "localhost"}:${process.env.REDIS_PORT || 6379}`;

		this.client = createClient({
			url,
			socket: {
				keepAlive: 60_000,
			},
		});

		this.client.on("error", (err) => {
			logError(err, "Redis Client Error");
		});

		this.client.on("connect", () => {
			logDebug("Redis Client Connected but not ready");
		});

		this.client.on("ready", () => {
			logDebug("✅ Redis Client Ready");
			this.isConnected = true;
		});

		this.client.on("end", () => {
			logDebug("Redis Client Disconnected");
			this.isConnected = false;
		});
	}

	public async connect(): Promise<void> {
		if (!this.isConnected) {
			try {
				// Ensure connect is only called once
				if (this.client.isReady) {
					this.isConnected = true;
					return;
				}

				logDebug("Connecting to Redis...");
				await this.client.connect();
				// The 'ready' event handler will set isConnected = true
			} catch (error) {
				this.isConnected = false;
				// Re-throw or exit here if Redis connection is mandatory
				logError(error, "Failed to connect to Redis");
				throw new Error("Redis connection failed.");
			}
		}
	}

	public async closeClient(): Promise<void> {
		if (this.client.isOpen) {
			await this.client.quit();
			logDebug("✅ Redis Client Disconnected");
		}
	}

	public getClient(): RedisClientType {
		return this.client;
	}

	public async get(key: string): Promise<string | null> {
		return await this.client.get(key);
	}

	public async set(key: string, value: string, options?: any): Promise<string | null> {
		return await this.client.set(key, value, options);
	}

	public async del(key: string): Promise<number> {
		return await this.client.del(key);
	}

	/**
	 * Delete all sessions matching a key pattern.
	 *
	 * @param pattern - Redis SCAN MATCH pattern, e.g. `sess:user:*`
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
