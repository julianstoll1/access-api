import { db } from "../lib/db";
import { AccessCheckResult } from "../types/access";

// CHECK
export async function checkAccess(
    projectId: string,
    user_id: string,
    resource: string
): Promise<AccessCheckResult> {

    const result = await db.query(
        `
            select 1
            from access_grants
            where project_id = $1
              and user_id = $2
              and resource = $3
              and (
                expires_at is null
                    or expires_at > now()
                )
                limit 1
        `,
        [projectId, user_id, resource]
    );

    return {
        access: result.rows.length > 0
    };
}

// GRANT (idempotent)
export async function grantAccess(
    projectId: string,
    user_id: string,
    resource: string,
    expires_at?: Date
) {
    await db.query(
        `
            insert into access_grants (
                project_id,
                user_id,
                resource,
                expires_at
            )
            values ($1, $2, $3, $4)
                on conflict (project_id, user_id, resource)
    do update set
                expires_at = excluded.expires_at
        `,
        [projectId, user_id, resource, expires_at ?? null]
    );
}

// REVOKE (idempotent)
export async function revokeAccess(
    projectId: string,
    user_id: string,
    resource: string
) {
    await db.query(
        `
            delete from access_grants
            where project_id = $1
              and user_id = $2
              and resource = $3
        `,
        [projectId, user_id, resource]
    );
}