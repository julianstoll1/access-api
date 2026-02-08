import { FastifyInstance } from "fastify";
import { checkAccess } from "../services/accessService";

export async function accessRoutes(app: FastifyInstance) {

    app.post("/access/check", async (request, reply) => {
        const { user_id, resource } = request.body as {
            user_id: string;
            resource: string;
        };

        const projectId = (request as any).projectId;

        const result = await checkAccess(projectId, {
            user_id,
            resource
        });

        return result;
    });

}