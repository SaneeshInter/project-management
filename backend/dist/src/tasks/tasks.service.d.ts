import { PrismaService } from '../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '@prisma/client';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTaskDto: CreateTaskDto, user: User): Promise<{
        project: {
            id: string;
            name: string;
        };
        _count: {
            comments: number;
        };
        assignee: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        projectId: string;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date | null;
        assigneeId: string | null;
    }>;
    findAll(projectId?: string, assigneeId?: string, user?: User): Promise<({
        project: {
            id: string;
            name: string;
        };
        _count: {
            comments: number;
        };
        assignee: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        projectId: string;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date | null;
        assigneeId: string | null;
    })[]>;
    findOne(id: string, user: User): Promise<{
        project: {
            id: string;
            name: string;
            ownerId: string;
        };
        comments: ({
            author: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            content: string;
            authorId: string;
            projectId: string | null;
            taskId: string | null;
        })[];
        assignee: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        projectId: string;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date | null;
        assigneeId: string | null;
    }>;
    update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<{
        project: {
            id: string;
            name: string;
        };
        assignee: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        projectId: string;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date | null;
        assigneeId: string | null;
    }>;
    remove(id: string, user: User): Promise<{
        message: string;
    }>;
}
