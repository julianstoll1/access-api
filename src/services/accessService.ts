import { AccessCheckResult } from "../types/access";

type Grant = {
    projectId: string;
    user_id: string;
    resource: string;
    expires_at?: Date;
};

// 🚧 In-memory Store (MVP)
const grants: Grant[] = [];

// CHECK
export async function checkAccess(
    projectId: string,
    user_id: string,
    resource: string
): Promise<AccessCheckResult> {

    const grant = grants.find(
        g =>
            g.projectId === projectId &&
            g.user_id === user_id &&
            g.resource === resource
    );

    if (!grant) {
        return { access: false };
    }

    if (grant.expires_at && grant.expires_at < new Date()) {
        return { access: false };
    }

    return { access: true };
}

// GRANT (idempotent)
export async function grantAccess(
    projectId: string,
    user_id: string,
    resource: string,
    expires_at?: Date
) {
    const existing = grants.find(
        g =>
            g.projectId === projectId &&
            g.user_id === user_id &&
            g.resource === resource
    );

    if (existing) {
        existing.expires_at = expires_at;
        return;
    }

    grants.push({
        projectId,
        user_id,
        resource,
        expires_at
    });
}

// REVOKE (idempotent)
export async function revokeAccess(
    projectId: string,
    user_id: string,
    resource: string
) {
    const index = grants.findIndex(
        g =>
            g.projectId === projectId &&
            g.user_id === user_id &&
            g.resource === resource
    );

    if (index !== -1) {
        grants.splice(index, 1);
    }
}