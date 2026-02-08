import { FastifyInstance } from "fastify";
import {
    checkAccess,
    grantAccess,
    revokeAccess
} from "../services/accessService";

export async function accessRoutes(app: FastifyInstance) {

    app.post("/access/check", async (request) => {
        const { user_id, resource } = request.body as any;
        const projectId = (request as any).projectId;

        return checkAccess(projectId, user_id, resource);
    });

    app.post("/access/grant", async (request) => {
        const { user_id, resource, expires_at } = request.body as any;
        const projectId = (request as any).projectId;

        await grantAccess(
            projectId,
            user_id,
            resource,
            expires_at ? new Date(expires_at) : undefined
        );

        return { granted: true };
    });

    app.post("/access/revoke", async (request) => {
        const { user_id, resource } = request.body as any;
        const projectId = (request as any).projectId;

        await revokeAccess(projectId, user_id, resource);

        return { revoked: true };
    });

}