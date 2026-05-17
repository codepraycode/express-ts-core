import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { logInfo } from "../utils/logger";
import { envConfig } from "../../config/env.config";

/**
 * Singleton Socket.IO service.
 *
 * Call `socketService.init(httpServer)` once after the HTTP server starts,
 * then use `socketService.getIO()` anywhere you need to emit events.
 */
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
            logInfo("Socket.IO already initialised — skipping.");
            return;
        }

        this.io = new Server(server, {
            path: "/socket.io",
            cors: {
                origin: envConfig.CLIENT_URL,
                methods: ["GET", "POST"],
                credentials: true,
            },
            transports: ["websocket", "polling"],
        });

        logInfo("✅ Socket.IO initialised");
    }

    public getIO(): Server {
        if (!this.io) {
            throw new Error("Socket.IO has not been initialised. Call init(server) first.");
        }
        return this.io;
    }
}

export default SocketService.getInstance();
