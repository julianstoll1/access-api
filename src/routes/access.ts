import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
    checkAccess,
    grantAccess,
    revokeAccess,
} from "../services/accessService";
import { AccessBadRequestError, AccessRequestBody } from "../types/access";

type ProjectScopedRequest<TBody> = FastifyRequest<{ Body: TBody }> & {
    projectId?: string;
};

function handleAccessError(
    error: unknown,
    request: FastifyRequest,
    reply: FastifyReply
) {
    if (error instanceof AccessBadRequestError) {
        reply.code(error.statusCode).send({ error: error.message });
        return;
    }

    const pgError = error as { code?: string; message?: string };
    if (pgError.code === "22P02") {
        reply.code(400).send({ error: "Invalid input format" });
        return;
    }
    if (pgError.code === "23503") {
        reply.code(400).send({ error: "Invalid foreign key reference" });
        return;
    }
    if (pgError.code === "42703") {
        reply.code(500).send({ error: "Database schema mismatch" });
        return;
    }

    request.log.error({ err: error }, "Access route failed");
    reply.code(500).send({ error: "Internal server error" });
}

export async function accessRoutes(app: FastifyInstance) {
    // CHECK ACCESS
    app.post(
        "/access/check",
        async (
            request: FastifyRequest<{ Body: AccessRequestBody }>,
            reply: FastifyReply
        ) => {
            const scopedRequest =
                request as ProjectScopedRequest<AccessRequestBody>;
            const { user_id, permission } = scopedRequest.body;
            const projectId = scopedRequest.projectId;

            if (!user_id || !permission) {
                reply.code(400).send({ error: "Missing user_id or permission" });
                return;
            }

            if (!projectId) {
                reply.code(500).send({ error: "Internal server error" });
                return;
            }

            try {
                return await checkAccess(projectId, user_id, permission);
            } catch (error) {
                handleAccessError(error, request, reply);
            }
        }
    );

    // GRANT ACCESS
    app.post(
        "/access/grant",
        async (
            request: FastifyRequest<{ Body: AccessRequestBody }>,
            reply: FastifyReply
        ) => {
            const scopedRequest =
                request as ProjectScopedRequest<AccessRequestBody>;
            const { user_id, permission, expires_at } = scopedRequest.body;
            const projectId = scopedRequest.projectId;

            if (!user_id || !permission) {
                reply.code(400).send({ error: "Missing user_id or permission" });
                return;
            }

            if (!projectId) {
                reply.code(500).send({ error: "Internal server error" });
                return;
            }

            const expiresAt = expires_at ? new Date(expires_at) : undefined;
            if (expiresAt && Number.isNaN(expiresAt.getTime())) {
                reply.code(400).send({ error: "Invalid expires_at" });
                return;
            }

            try {
                await grantAccess(projectId, user_id, permission, expiresAt);
                return { granted: true };
            } catch (error) {
                handleAccessError(error, request, reply);
            }

        }
    );

    // REVOKE ACCESS
    app.post(
        "/access/revoke",
        async (
            request: FastifyRequest<{ Body: AccessRequestBody }>,
            reply: FastifyReply
        ) => {
            const scopedRequest =
                request as ProjectScopedRequest<AccessRequestBody>;
            const { user_id, permission } = scopedRequest.body;
            const projectId = scopedRequest.projectId;

            if (!user_id || !permission) {
                reply.code(400).send({ error: "Missing user_id or permission" });
                return;
            }

            if (!projectId) {
                reply.code(500).send({ error: "Internal server error" });
                return;
            }

            try {
                await revokeAccess(projectId, user_id, permission);
                return { revoked: true };
            } catch (error) {
                handleAccessError(error, request, reply);
            }

        }
    );
}
