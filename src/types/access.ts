export interface AccessRequestBody {
    user_id: string;
    permission: string;
    expires_at?: string;
}

export interface AccessCheckResult {
    access: boolean;
}

export class AccessBadRequestError extends Error {
    readonly statusCode = 400;

    constructor(message: string) {
        super(message);
        this.name = "AccessBadRequestError";
    }
}
