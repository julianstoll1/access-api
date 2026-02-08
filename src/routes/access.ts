import { FastifyInstance, FastifyRequest } from "fastify";
import {
    checkAccess,
    grantAccess,
    revokeAccess,
} from "../services/accessService";

type AccessBody = {
    user_id: string;
    resource: string;
    expires_at?: string;
};

export async function accessRoutes(app: FastifyInstance) {
    // CHECK ACCESS
    app.post(
        "/access/check",
        async (request: FastifyRequest<{ Body: AccessBody }>, reply) => {
            const { user_id, resource } = request.body;
            const projectId = (request as any).projectId;

            if (!user_id || !resource) {
                reply.code(400).send({ error: "Missing user_id or resource" });
                return;
            }

            return checkAccess(projectId, user_id, resource);
        }
    );

    // GRANT ACCESS
    app.post(
        "/access/grant",
        async (request: FastifyRequest<{ Body: AccessBody }>, reply) => {
            const { user_id, resource, expires_at } = request.body;
            const projectId = (request as any).projectId;

            if (!user_id || !resource) {
                reply.code(400).send({ error: "Missing user_id or resource" });
                return;
            }

            await grantAccess(
                projectId,
                user_id,
                resource,
                expires_at ? new Date(expires_at) : undefined
            );

            return { granted: true };
        }
    );

    // REVOKE ACCESS
    app.post(
        "/access/revoke",
        async (request: FastifyRequest<{ Body: AccessBody }>, reply) => {
            const { user_id, resource } = request.body;
            const projectId = (request as any).projectId;

            if (!user_id || !resource) {
                reply.code(400).send({ error: "Missing user_id or resource" });
                return;
            }

            await revokeAccess(projectId, user_id, resource);

            return { revoked: true };
        }
    );
}