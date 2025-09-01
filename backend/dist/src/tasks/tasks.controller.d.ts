import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User as UserEntity } from '@prisma/client';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto, user: UserEntity): Promise<{
        project: {
            name: string;
            id: string;
        };
        _count: {
            comments: number;
        };
        assignee: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        projectId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date | null;
        assigneeId: string | null;
    }>;
    findAll(projectId: string, assigneeId: string, user: UserEntity): Promise<({
        project: {
            name: string;
            id: string;
        };
        _count: {
            comments: number;
        };
        assignee: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        projectId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date | null;
        assigneeId: string | null;
    })[]>;
    findOne(id: string, user: UserEntity): Promise<{
        project: {
            name: string;
            id: string;
            ownerId: string;
        };
        comments: ({
            author: {
                name: string;
                email: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            content: string;
            projectId: string | null;
            authorId: string;
            taskId: string | null;
        })[];
        assignee: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        projectId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date | null;
        assigneeId: string | null;
    }>;
    update(id: string, updateTaskDto: UpdateTaskDto, user: UserEntity): Promise<{
        project: {
            name: string;
            id: string;
        };
        assignee: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        projectId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date | null;
        assigneeId: string | null;
    }>;
    remove(id: string, user: UserEntity): Promise<{
        message: string;
    }>;
}
