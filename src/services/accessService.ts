import { db } from "../lib/db";
import { AccessBadRequestError, AccessCheckResult } from "../types/access";

type PermissionRecord = {
    id: string;
    enabled: boolean;
};

type AccessGrantRecord = {
    expires_at: Date | null;
};

type GrantKeyColumn = "permission_id" | "permission" | "resource";

let grantKeyColumnPromise: Promise<GrantKeyColumn> | null = null;

async function resolveGrantKeyColumn(): Promise<GrantKeyColumn> {
    const result = await db.query<{ column_name: string }>(
        `
            select column_name
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'access_grants'
              and column_name in ('permission_id', 'permission', 'resource')
        `
    );

    const columns = new Set(result.rows.map((row) => row.column_name));

    if (columns.has("permission_id")) {
        return "permission_id";
    }
    if (columns.has("permission")) {
        return "permission";
    }
    if (columns.has("resource")) {
        return "resource";
    }

    throw new Error(
        "access_grants must contain one of: permission_id, permission, resource"
    );
}

async function getGrantKeyColumn(): Promise<GrantKeyColumn> {
    if (!grantKeyColumnPromise) {
        grantKeyColumnPromise = resolveGrantKeyColumn();
    }

    return grantKeyColumnPromise;
}

async function getPermissionOrThrow(
    projectId: string,
    permissionSlug: string
): Promise<PermissionRecord> {
    const permissionResult = await db.query<PermissionRecord>(
        `
            select id, enabled
            from permissions
            where project_id = $1
              and slug = $2
            limit 1
        `,
        [projectId, permissionSlug]
    );

    if (permissionResult.rows.length === 0) {
        throw new AccessBadRequestError("Permission does not exist");
    }

    return permissionResult.rows[0];
}

// CHECK
export async function checkAccess(
    projectId: string,
    userId: string,
    permission: string
): Promise<AccessCheckResult> {
    const permissionRecord = await getPermissionOrThrow(projectId, permission);
    const grantKeyColumn = await getGrantKeyColumn();
    const grantKeyValue =
        grantKeyColumn === "permission_id" ? permissionRecord.id : permission;

    if (!permissionRecord.enabled) {
        return { access: false };
    }

    const grantResult = await db.query<AccessGrantRecord>(
        `
            select expires_at
            from access_grants
            where project_id = $1
              and user_id = $2
              and ${grantKeyColumn} = $3
            limit 1
        `,
        [projectId, userId, grantKeyValue]
    );

    if (grantResult.rows.length === 0) {
        return { access: false };
    }

    const grant = grantResult.rows[0];

    if (grant.expires_at && grant.expires_at <= new Date()) {
        return { access: false };
    }

    await db.query(
        `
            update permissions
            set usage_count = usage_count + 1,
                last_used_at = now()
            where id = $1
              and project_id = $2
        `,
        [permissionRecord.id, projectId]
    );

    return {
        access: true
    };
}

// GRANT (idempotent)
export async function grantAccess(
    projectId: string,
    userId: string,
    permission: string,
    expiresAt?: Date
) {
    const permissionRecord = await getPermissionOrThrow(projectId, permission);
    const grantKeyColumn = await getGrantKeyColumn();
    const grantKeyValue =
        grantKeyColumn === "permission_id" ? permissionRecord.id : permission;

    const updateResult = await db.query(
        `
            update access_grants
            set expires_at = $4
            where project_id = $1
              and user_id = $2
              and ${grantKeyColumn} = $3
        `,
        [projectId, userId, grantKeyValue, expiresAt ?? null]
    );

    if (updateResult.rowCount && updateResult.rowCount > 0) {
        return;
    }

    await db.query(
        `
            insert into access_grants (
                project_id,
                user_id,
                ${grantKeyColumn},
                expires_at
            )
            values ($1, $2, $3, $4)
        `,
        [projectId, userId, grantKeyValue, expiresAt ?? null]
    );
}

// REVOKE (idempotent)
export async function revokeAccess(
    projectId: string,
    userId: string,
    permission: string
) {
    const permissionRecord = await getPermissionOrThrow(projectId, permission);
    const grantKeyColumn = await getGrantKeyColumn();
    const grantKeyValue =
        grantKeyColumn === "permission_id" ? permissionRecord.id : permission;

    await db.query(
        `
            delete from access_grants
            where project_id = $1
              and user_id = $2
              and ${grantKeyColumn} = $3
        `,
        [projectId, userId, grantKeyValue]
    );
}
