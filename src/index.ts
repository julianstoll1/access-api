import Fastify from "fastify";
import { accessRoutes } from "./routes/access";

const app = Fastify({ logger: true });

app.register(accessRoutes);

app.get("/health", async () => ({ ok: true }));

app.listen({ port: 3000 }, () => {
    console.log("Access API running on :3000");
});