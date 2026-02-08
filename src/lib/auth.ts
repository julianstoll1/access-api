import { FastifyRequest, FastifyReply } from "fastify";
import crypto from "crypto";
import { db } from "./db";

export async function apiKeyAuth(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        reply.code(401).send({ error: "Missing API key" });
        return;
    }

    const rawApiKey = authHeader.replace("Bearer ", "").trim();

    // 🔐 API Key hashen (muss identisch zum Dashboard sein)
    const keyHash = crypto
        .createHash("sha256")
        .update(rawApiKey)
        .digest("hex");

    // 🔍 API Key prüfen & Project ermitteln
    const result = await db.query(
        `
      select project_id
      from api_keys
      where key_hash = $1
    `,
        [keyHash]
    );

    if (result.rowCount === 0) {
        reply.code(401).send({ error: "Invalid API key" });
        return;
    }

    // ✅ Projekt-Kontext an Request hängen
    (request as any).projectId = result.rows[0].project_id;
}