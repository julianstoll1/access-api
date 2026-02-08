import { AccessCheckInput, AccessCheckResult } from "../types/access";

export async function checkAccess(
    projectId: string,
    input: AccessCheckInput
): Promise<AccessCheckResult> {

    // 🚧 Fake-Logic fürs MVP
    if (
        projectId === "project_test" &&
        input.user_id === "user_123" &&
        input.resource === "course_ultra"
    ) {
        return { access: true };
    }

    return { access: false };
}