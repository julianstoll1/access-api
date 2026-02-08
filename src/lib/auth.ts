import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "./db";

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

    const result = await db.query(
        `
    select project_id
    from api_keys
    where key = $1
      and is_active = true
    `,
        [apiKey]
    );

    if (result.rowCount === 0) {
        reply.code(401).send({ error: "Invalid API key" });
        return;
    }

    // Projekt-Kontext setzen
    (request as any).projectId = result.rows[0].project_id;
}