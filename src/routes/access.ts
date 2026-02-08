import { FastifyInstance } from "fastify";

export async function accessRoutes(app: FastifyInstance) {
    app.get("/access/test", async () => {
        return { ok: true };
    });
}