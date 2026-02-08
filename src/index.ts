import Fastify from "fastify";
import { accessRoutes } from "./routes/access";
import { apiKeyAuth } from "./lib/auth";

const app = Fastify({ logger: true });

// 🔐 API-Key Middleware (global)
app.addHook("preHandler", apiKeyAuth);

// Routes
app.register(accessRoutes);

// Healthcheck
app.get("/health", async () => ({ ok: true }));

app.listen({ port: 3000 }, () => {
    console.log("Access API running on http://localhost:3000");
});