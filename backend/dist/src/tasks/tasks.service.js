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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const client_1 = require("@prisma/client");
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTaskDto, user) {
        const project = await this.prisma.project.findUnique({
            where: { id: createTaskDto.projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${createTaskDto.projectId} not found`);
        }
        if (user.role === client_1.Role.CLIENT && project.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied to this project');
        }
        return this.prisma.task.create({
            data: createTaskDto,
            include: {
                assignee: {
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
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
        });
    }
    async findAll(projectId, assigneeId, user) {
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
        if (assigneeId) {
            where.assigneeId = assigneeId;
        }
        if (user && user.role === client_1.Role.CLIENT) {
            where.project = {
                ownerId: user.id,
            };
        }
        return this.prisma.task.findMany({
            where,
            include: {
                assignee: {
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
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, user) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                assignee: {
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
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        if (user.role === client_1.Role.CLIENT && task.project.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied to this task');
        }
        return task;
    }
    async update(id, updateTaskDto, user) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                project: true,
            },
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        if (user.role === client_1.Role.CLIENT && task.project.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied to this task');
        }
        return this.prisma.task.update({
            where: { id },
            data: updateTaskDto,
            include: {
                assignee: {
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
            },
        });
    }
    async remove(id, user) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                project: true,
            },
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        if (user.role === client_1.Role.CLIENT && task.project.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied to this task');
        }
        await this.prisma.task.delete({ where: { id } });
        return { message: 'Task deleted successfully' };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map