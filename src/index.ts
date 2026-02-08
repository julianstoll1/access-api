import Fastify from "fastify";
import { accessRoutes } from "./routes/access";
import { apiKeyAuth } from "./lib/auth";

const app = Fastify({ logger: true });

// 🔐 API-Key Middleware (WICHTIG)
app.addHook("preHandler", apiKeyAuth);

app.register(accessRoutes);

app.get("/health", async () => ({ ok: true }));

app.listen({ port: 3000 }, () => {
    console.log("Access API running on :3000");
});