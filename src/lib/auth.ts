import { FastifyRequest, FastifyReply } from "fastify";

export async function apiKeyAuth(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
        reply.code(401).send({ error: "Missing API key" });
        return;
    }

    const apiKey = authHeader.replace("Bearer ", "");

    if (apiKey !== "test_key") {
        reply.code(401).send({ error: "Invalid API key" });
        return;
    }

    (request as any).projectId = "project_test";
}