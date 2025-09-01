"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const client_1 = require("@prisma/client");
let CommentsService = class CommentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCommentDto, user) {
        const { projectId, taskId } = createCommentDto;
        if ((!projectId && !taskId) || (projectId && taskId)) {
            throw new common_1.BadRequestException('Provide either projectId or taskId, not both');
        }
        if (projectId) {
            const project = await this.prisma.project.findUnique({
                where: { id: projectId },
            });
            if (!project) {
                throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
            }
            if (user.role === client_1.Role.CLIENT && project.ownerId !== user.id) {
                throw new common_1.ForbiddenException('Access denied to this project');
            }
        }
        if (taskId) {
            const task = await this.prisma.task.findUnique({
                where: { id: taskId },
                include: { project: true },
            });
            if (!task) {
                throw new common_1.NotFoundException(`Task with ID ${taskId} not found`);
            }
            if (user.role === client_1.Role.CLIENT && task.project.ownerId !== user.id) {
                throw new common_1.ForbiddenException('Access denied to this task');
            }
        }
        return this.prisma.comment.create({
            data: {
                content: createCommentDto.content,
                authorId: user.id,
                projectId: projectId || null,
                taskId: taskId || null,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                project: projectId ? {
                    select: {
                        id: true,
                        name: true,
                    },
                } : false,
                task: taskId ? {
                    select: {
                        id: true,
                        title: true,
                    },
                } : false,
            },
        });
    }
    async findAll(projectId, taskId, user) {
        const where = {};
        if (projectId) {
            if (user && user.role === client_1.Role.CLIENT) {
                const project = await this.prisma.project.findUnique({
                    where: { id: projectId },
                });
                if (project && project.ownerId !== user.id) {
                    throw new common_1.ForbiddenException('Access denied to this project');
                }
            }
            where.projectId = projectId;
        }
        if (taskId) {
            if (user && user.role === client_1.Role.CLIENT) {
                const task = await this.prisma.task.findUnique({
                    where: { id: taskId },
                    include: { project: true },
                });
                if (task && task.project.ownerId !== user.id) {
                    throw new common_1.ForbiddenException('Access denied to this task');
                }
            }
            where.taskId = taskId;
        }
        return this.prisma.comment.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                task: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, user) {
        const comment = await this.prisma.comment.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                        ownerId: true,
                    },
                },
                task: {
                    select: {
                        id: true,
                        title: true,
                        project: {
                            select: {
                                ownerId: true,
                            },
                        },
                    },
                },
            },
        });
        if (!comment) {
            throw new common_1.NotFoundException(`Comment with ID ${id} not found`);
        }
        const projectOwnerId = comment.project?.ownerId || comment.task?.project?.ownerId;
        if (user.role === client_1.Role.CLIENT && projectOwnerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied to this comment');
        }
        return comment;
    }
    async update(id, updateCommentDto, user) {
        const comment = await this.prisma.comment.findUnique({
            where: { id },
            include: {
                project: true,
                task: {
                    include: { project: true },
                },
            },
        });
        if (!comment) {
            throw new common_1.NotFoundException(`Comment with ID ${id} not found`);
        }
        if (comment.authorId !== user.id && user.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('You can only edit your own comments');
        }
        return this.prisma.comment.update({
            where: { id },
            data: updateCommentDto,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async remove(id, user) {
        const comment = await this.prisma.comment.findUnique({
            where: { id },
        });
        if (!comment) {
            throw new common_1.NotFoundException(`Comment with ID ${id} not found`);
        }
        if (comment.authorId !== user.id && user.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('You can only delete your own comments');
        }
        await this.prisma.comment.delete({ where: { id } });
        return { message: 'Comment deleted successfully' };
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map