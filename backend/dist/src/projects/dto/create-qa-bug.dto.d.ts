import { BugSeverity } from '@prisma/client';
export declare class CreateQABugDto {
    title: string;
    description: string;
    severity: BugSeverity;
    assignedToId?: string;
    screenshot?: string;
    steps?: string;
}
