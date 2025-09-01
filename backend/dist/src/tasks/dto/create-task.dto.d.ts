import { TaskStatus, Priority } from '@prisma/client';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: Priority;
    dueDate?: string;
    assigneeId?: string;
    projectId: string;
}
