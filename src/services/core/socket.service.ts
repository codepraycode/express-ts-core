import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { logInfo } from "../../utils/logger";

class SocketService {
	private static instance: SocketService;
	private io: Server | null = null;

	private constructor() {}

	public static getInstance(): SocketService {
		if (!SocketService.instance) {
			SocketService.instance = new SocketService();
		}
		return SocketService.instance;
	}

	public init(server: HttpServer): void {
		if (this.io) {
			logInfo("Socket.IO already initialized");
			return;
		}

		const corsOptions = {
			origin: "*",
			methods: ["GET", "POST"],
			credentials: true,
			allowedHeaders: ["Content-Type", "Authorization", "X-Profile-Id"],
		};

		this.io = new Server(server, {
			path: "/socket.io",
			cors: corsOptions,
			transports: ["websocket", "polling"],
		});

		logInfo("✅ Socket.IO Core Service Initialized");
	}

	public getIO(): Server {
		if (!this.io) {
			throw new Error("Socket.IO not initialized. Call init() first.");
		}
		return this.io;
	}
}

export default SocketService.getInstance();
