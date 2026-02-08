import "dotenv/config";
import Fastify from "fastify";
import { accessRoutes } from "./routes/access";
import { apiKeyAuth } from "./lib/auth";

const app = Fastify({ logger: true });

// 🔐 API Key Middleware (global)
// → validiert API key
// → hängt projectId an request
app.addHook("preHandler", apiKeyAuth);

// Routes
app.register(accessRoutes);

// Healthcheck (ohne Auth)
app.get("/health", async () => ({ ok: true }));

app.listen({ port: 3001 }, () => {
    console.log("Access API running on http://localhost:3001");
});