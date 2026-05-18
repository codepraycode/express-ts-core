import request from "supertest";
import { createApp } from "../src/app";

const app = createApp();

describe("App Health Check", () => {
    it("should return 200 OK and healthy status for GET /health", async () => {
        const res = await request(app).get("/health");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("status", "healthy");
        expect(res.body).toHaveProperty("timestamp");
    });

    it("should return 200 OK and env status for GET /", async () => {
        const res = await request(app).get("/");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("status", "ok");
        expect(res.body).toHaveProperty("environment", "test");
    });
});
