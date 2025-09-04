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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../database/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const password = createUserDto.password || 'inter123';
        const hashedPassword = await bcrypt.hash(password, 12);
        const role = await this.prisma.roleMaster.findUnique({
            where: { id: createUserDto.roleId }
        });
        const department = await this.prisma.departmentMaster.findUnique({
            where: { id: createUserDto.departmentId }
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${createUserDto.roleId} not found`);
        }
        if (!department) {
            throw new common_1.NotFoundException(`Department with ID ${createUserDto.departmentId} not found`);
        }
        return this.prisma.user.create({
            data: {
                email: createUserDto.email,
                name: createUserDto.name,
                password: hashedPassword,
                roleId: createUserDto.roleId,
                departmentId: createUserDto.departmentId,
                avatar: createUserDto.avatar,
            },
            include: {
                roleMaster: true,
                departmentMaster: true,
            },
        });
    }
    async findAll() {
        return this.prisma.user.findMany({
            include: {
                roleMaster: true,
                departmentMaster: true,
            },
            orderBy: [
                { departmentMaster: { order: 'asc' } },
                { roleMaster: { name: 'asc' } },
                { name: 'asc' }
            ],
        });
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                roleMaster: true,
                departmentMaster: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async update(id, updateUserDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            include: {
                roleMaster: true,
                departmentMaster: true,
            },
        });
    }
    async remove(id, force = false) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                ownedProjects: true,
                comments: true,
                assignedTasks: true,
                assignedCorrections: true,
                requestedCorrections: true,
                departmentTransitions: true,
                departmentPermissions: true,
                bugAssignments: true,
                qaTestingRounds: true,
                approvalRequests: true,
                approvalReviews: true,
            }
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        const hasRelatedRecords = user.ownedProjects.length > 0 ||
            user.comments.length > 0 ||
            user.assignedTasks.length > 0 ||
            user.assignedCorrections.length > 0 ||
            user.requestedCorrections.length > 0 ||
            user.departmentTransitions.length > 0 ||
            user.departmentPermissions.length > 0 ||
            user.bugAssignments.length > 0 ||
            user.qaTestingRounds.length > 0 ||
            user.approvalRequests.length > 0 ||
            user.approvalReviews.length > 0;
        if (hasRelatedRecords && !force) {
            throw new common_1.BadRequestException(`Cannot delete ${user.name}. This user has related records (projects, tasks, comments, etc.). Please reassign or remove these records first.`);
        }
        if (force && hasRelatedRecords) {
            await this.prisma.$transaction(async (tx) => {
                await tx.qABug.deleteMany({ where: { assignedToId: id } });
                await tx.qATestingRound.deleteMany({ where: { testedById: id } });
                await tx.workflowApproval.deleteMany({
                    where: { OR: [{ requestedById: id }, { reviewedById: id }] }
                });
                await tx.departmentCorrection.deleteMany({
                    where: { OR: [{ assignedToId: id }, { requestedById: id }] }
                });
                await tx.projectDepartmentHistory.deleteMany({
                    where: { OR: [{ movedById: id }, { permissionGrantedById: id }] }
                });
                await tx.comment.deleteMany({ where: { authorId: id } });
                const ownedProjectIds = user.ownedProjects.map(p => p.id);
                if (ownedProjectIds.length > 0) {
                    await tx.customField.deleteMany({
                        where: { projectId: { in: ownedProjectIds } }
                    });
                    await tx.task.deleteMany({
                        where: { projectId: { in: ownedProjectIds } }
                    });
                    await tx.comment.deleteMany({
                        where: { projectId: { in: ownedProjectIds } }
                    });
                    await tx.project.deleteMany({ where: { ownerId: id } });
                }
                await tx.task.updateMany({
                    where: {
                        assigneeId: id,
                        projectId: { notIn: ownedProjectIds }
                    },
                    data: { assigneeId: null }
                });
                await tx.user.delete({ where: { id } });
            });
            return { message: `User ${user.name} and all related records deleted successfully` };
        }
        await this.prisma.user.delete({ where: { id } });
        return { message: 'User deleted successfully' };
    }
    async getPMOCoordinators() {
        return this.prisma.user.findMany({
            where: {
                departmentMaster: {
                    code: 'PMO'
                },
                roleMaster: {
                    code: {
                        in: ['PC', 'PC_TL1', 'PC_TL2']
                    }
                }
            },
            include: {
                roleMaster: true,
                departmentMaster: true,
            },
            orderBy: [
                { departmentMaster: { order: 'asc' } },
                { roleMaster: { code: 'asc' } },
                { name: 'asc' }
            ]
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map