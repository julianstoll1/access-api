export interface AccessCheckInput {
    user_id: string;
    resource: string;
}

export interface AccessCheckResult {
    access: boolean;
}