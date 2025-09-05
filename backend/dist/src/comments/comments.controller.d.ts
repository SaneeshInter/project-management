import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User as UserEntity } from '@prisma/client';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(createCommentDto: CreateCommentDto, user: UserEntity): Promise<{
        project: {
            name: string;
            id: string;
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
        };
        author: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        authorId: string;
        projectId: string | null;
        taskId: string | null;
    }>;
    findAll(projectId: string, taskId: string, user: UserEntity): Promise<({
        project: {
            name: string;
            id: string;
        };
        task: {
            title: string;
            id: string;
        };
        author: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        authorId: string;
        projectId: string | null;
        taskId: string | null;
    })[]>;
    findOne(id: string, user: UserEntity): Promise<{
        project: {
            name: string;
            id: string;
            ownerId: string;
        };
        task: {
            project: {
                ownerId: string;
            };
            title: string;
            id: string;
        };
        author: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        authorId: string;
        projectId: string | null;
        taskId: string | null;
    }>;
    update(id: string, updateCommentDto: UpdateCommentDto, user: UserEntity): Promise<{
        author: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        authorId: string;
        projectId: string | null;
        taskId: string | null;
    }>;
    remove(id: string, user: UserEntity): Promise<{
        message: string;
    }>;
}
