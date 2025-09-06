import { PrismaService } from '../database/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '@prisma/client';
export declare class CommentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCommentDto: CreateCommentDto, user: User): Promise<{
        project: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            office: string;
            category: import(".prisma/client").$Enums.ProjectCategory;
            pagesCount: number | null;
            targetDate: Date;
            status: import(".prisma/client").$Enums.ProjectStatus;
            ownerId: string;
            clientName: string | null;
            observations: string | null;
            monthsPassed: number;
            startDate: Date;
            deviationReason: string | null;
            dependency: boolean;
            disabled: boolean;
            disabledAt: Date | null;
            disabledBy: string | null;
            currentDepartment: import(".prisma/client").$Enums.Department;
            nextDepartment: import(".prisma/client").$Enums.Department | null;
            projectCode: string;
            projectCoordinatorId: string | null;
            pcTeamLeadId: string | null;
        };
        task: {
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
        };
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
    }>;
    findAll(projectId?: string, taskId?: string, user?: User): Promise<({
        project: {
            id: string;
            name: string;
        };
        task: {
            id: string;
            title: string;
        };
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
    })[]>;
    findOne(id: string, user: User): Promise<{
        project: {
            id: string;
            name: string;
            ownerId: string;
        };
        task: {
            project: {
                ownerId: string;
            };
            id: string;
            title: string;
        };
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
    }>;
    update(id: string, updateCommentDto: UpdateCommentDto, user: User): Promise<{
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
    }>;
    remove(id: string, user: User): Promise<{
        message: string;
    }>;
}
