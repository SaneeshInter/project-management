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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const workflow_rules_service_1 = require("./services/workflow-rules.service");
const workflow_validator_service_1 = require("./services/workflow-validator.service");
const client_1 = require("@prisma/client");
const project_code_util_1 = require("../utils/project-code.util");
let ProjectsService = class ProjectsService {
    constructor(prisma, workflowRules, workflowValidator) {
        this.prisma = prisma;
        this.workflowRules = workflowRules;
        this.workflowValidator = workflowValidator;
    }
    async create(createProjectDto, user) {
        console.log('🔍 Creating project with data:', createProjectDto);
        console.log('🔍 User creating project:', user.id, user.name);
        const currentDepartment = await this.prisma.departmentMaster.findUnique({
            where: { id: createProjectDto.currentDepartmentId }
        });
        if (!currentDepartment) {
            throw new common_1.NotFoundException(`Current department with ID ${createProjectDto.currentDepartmentId} not found`);
        }
        if (createProjectDto.nextDepartmentId) {
            const nextDepartment = await this.prisma.departmentMaster.findUnique({
                where: { id: createProjectDto.nextDepartmentId }
            });
            if (!nextDepartment) {
                throw new common_1.NotFoundException(`Next department with ID ${createProjectDto.nextDepartmentId} not found`);
            }
        }
        const project = await this.prisma.project.create({
            data: {
                name: createProjectDto.name,
                office: createProjectDto.office,
                category: createProjectDto.category,
                pagesCount: createProjectDto.pagesCount,
                currentDepartment: currentDepartment.code,
                nextDepartment: createProjectDto.nextDepartmentId ?
                    (await this.prisma.departmentMaster.findUnique({ where: { id: createProjectDto.nextDepartmentId } }))?.code :
                    undefined,
                targetDate: createProjectDto.targetDate,
                status: createProjectDto.status,
                clientName: createProjectDto.clientName,
                observations: createProjectDto.observations,
                deviationReason: createProjectDto.deviationReason,
                dependency: createProjectDto.dependency,
                startDate: createProjectDto.startDate,
                projectCoordinatorId: createProjectDto.projectCoordinatorId,
                pcTeamLeadId: createProjectDto.pcTeamLeadId,
                ownerId: user.id,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                projectCoordinator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                pcTeamLead: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                        comments: true,
                    },
                },
            },
        });
        console.log('✅ Project created:', project.id, project.name);
        try {
            const departmentHistory = await this.prisma.projectDepartmentHistory.create({
                data: {
                    projectId: project.id,
                    fromDepartment: null,
                    toDepartment: currentDepartment.code,
                    workStatus: client_1.DepartmentWorkStatus.NOT_STARTED,
                    movedById: user.id,
                    permissionGrantedById: user.id,
                    notes: 'Initial project creation',
                },
            });
            console.log('✅ Department history created:', departmentHistory.id);
        }
        catch (historyError) {
            console.error('❌ Failed to create department history:', historyError);
        }
        try {
            if (createProjectDto.projectCoordinatorId) {
                await this.prisma.projectAssignmentHistory.create({
                    data: {
                        projectId: project.id,
                        assignmentType: client_1.ProjectAssignmentType.PROJECT_COORDINATOR,
                        newUserId: createProjectDto.projectCoordinatorId,
                        assignedById: user.id,
                        reason: 'Initial project creation',
                    },
                });
            }
            if (createProjectDto.pcTeamLeadId) {
                await this.prisma.projectAssignmentHistory.create({
                    data: {
                        projectId: project.id,
                        assignmentType: client_1.ProjectAssignmentType.PC_TEAM_LEAD,
                        newUserId: createProjectDto.pcTeamLeadId,
                        assignedById: user.id,
                        reason: 'Initial project creation',
                    },
                });
            }
        }
        catch (assignmentError) {
            console.error('❌ Failed to create assignment history:', assignmentError);
        }
        return project;
    }
    async findAll(userId, role, user) {
        let where = {};
        const userWithDept = userId ? await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                departmentMaster: true,
                roleMaster: true,
            },
        }) : null;
        const roleCode = userWithDept?.roleMaster?.code || role?.toString();
        if (roleCode === 'CLIENT') {
            where = { ownerId: userId };
        }
        else if (roleCode === 'ADMIN' || roleCode === 'PROJECT_MANAGER') {
            where = {};
        }
        else if (userWithDept?.departmentMaster?.code === 'PMO') {
            where = {
                OR: [
                    { projectCoordinatorId: userId },
                    { pcTeamLeadId: userId },
                ],
            };
        }
        else if (userWithDept?.departmentMaster?.code) {
            where = {
                OR: [
                    { currentDepartment: userWithDept.departmentMaster.code },
                    {
                        departmentHistory: {
                            some: {
                                toDepartment: userWithDept.departmentMaster.code,
                            },
                        },
                    },
                ],
            };
        }
        return this.prisma.project.findMany({
            where,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                projectCoordinator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                        comments: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, user) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                tasks: {
                    include: {
                        assignee: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        _count: {
                            select: {
                                comments: true,
                            },
                        },
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
                customFields: true,
                departmentHistory: {
                    include: {
                        movedBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            },
                        },
                        permissionGrantedBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            },
                        },
                        corrections: {
                            include: {
                                requestedBy: {
                                    select: { id: true, name: true, email: true, role: true },
                                },
                                assignedTo: {
                                    select: { id: true, name: true, email: true, role: true },
                                },
                            },
                            orderBy: { requestedAt: 'desc' },
                        },
                        approvals: {
                            include: {
                                requestedBy: {
                                    select: { id: true, name: true, email: true, role: true },
                                },
                                reviewedBy: {
                                    select: { id: true, name: true, email: true, role: true },
                                },
                            },
                            orderBy: { requestedAt: 'desc' },
                        },
                        qaRounds: {
                            include: {
                                testedBy: {
                                    select: { id: true, name: true, email: true, role: true },
                                },
                                bugs: {
                                    include: {
                                        assignedTo: {
                                            select: { id: true, name: true, email: true, role: true },
                                        },
                                    },
                                    orderBy: { foundAt: 'desc' },
                                },
                            },
                            orderBy: { roundNumber: 'asc' },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        if (user.role === client_1.Role.CLIENT && project.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied to this project');
        }
        return project;
    }
    async update(id, updateProjectDto, user) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        if (user.role === client_1.Role.CLIENT && project.ownerId !== user.id) {
            throw new common_1.ForbiddenException('You can only update your own projects');
        }
        return this.prisma.project.update({
            where: { id },
            data: updateProjectDto,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                        comments: true,
                    },
                },
            },
        });
    }
    async remove(id, user) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        if (user.role !== client_1.Role.ADMIN && project.ownerId !== user.id) {
            throw new common_1.ForbiddenException('You can only delete your own projects');
        }
        await this.prisma.project.delete({ where: { id } });
        return { message: 'Project deleted successfully' };
    }
    async addCustomField(projectId, fieldName, fieldValue, user) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        if (user.role === client_1.Role.CLIENT && project.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied to this project');
        }
        return this.prisma.customField.create({
            data: {
                fieldName,
                fieldValue,
                projectId,
            },
        });
    }
    async moveToDepartment(projectId, transitionDto, user) {
        const permissionCheck = await this.workflowValidator.validateWorkflowPermission(projectId, 'move_department', user);
        if (!permissionCheck.valid) {
            throw new common_1.ForbiddenException(permissionCheck.errors.join(', '));
        }
        const transitionCheck = await this.workflowValidator.validateDepartmentTransition(projectId, transitionDto.toDepartment, user);
        if (!transitionCheck.valid) {
            throw new common_1.BadRequestException(`Workflow validation failed: ${transitionCheck.errors.join(', ')}`);
        }
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                departmentHistory: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.projectDepartmentHistory.create({
                data: {
                    projectId,
                    fromDepartment: project.currentDepartment,
                    toDepartment: transitionDto.toDepartment,
                    estimatedDays: transitionDto.estimatedDays,
                    workStatus: client_1.DepartmentWorkStatus.NOT_STARTED,
                    movedById: user.id,
                    permissionGrantedById: transitionDto.permissionGrantedById || user.id,
                    notes: transitionDto.notes,
                },
            });
            const newProjectCode = (0, project_code_util_1.generateProjectCode)(project.departmentHistory);
            return tx.project.update({
                where: { id: projectId },
                data: {
                    currentDepartment: transitionDto.toDepartment,
                    projectCode: newProjectCode,
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            department: true,
                        },
                    },
                    departmentHistory: {
                        include: {
                            movedBy: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                    _count: {
                        select: {
                            tasks: true,
                            comments: true,
                        },
                    },
                },
            });
        });
    }
    async getDepartmentHistory(projectId, user) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        if (user.role === client_1.Role.CLIENT && project.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied to this project');
        }
        return this.prisma.projectDepartmentHistory.findMany({
            where: { projectId },
            include: {
                movedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateDepartmentWorkStatus(projectId, statusDto, user) {
        const statusValidation = await this.workflowValidator.validateStatusUpdate(projectId, statusDto.workStatus, user);
        if (!statusValidation.valid) {
            throw new common_1.BadRequestException(`Status update validation failed: ${statusValidation.errors.join(', ')}`);
        }
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                departmentHistory: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        let currentDepartmentHistory = await this.prisma.projectDepartmentHistory.findFirst({
            where: {
                projectId,
                toDepartment: project.currentDepartment,
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!currentDepartmentHistory) {
            currentDepartmentHistory = await this.prisma.projectDepartmentHistory.create({
                data: {
                    projectId,
                    fromDepartment: null,
                    toDepartment: project.currentDepartment,
                    workStatus: client_1.DepartmentWorkStatus.NOT_STARTED,
                    movedById: user.id,
                    permissionGrantedById: user.id,
                    notes: 'Auto-created missing department history record',
                },
            });
        }
        let actualDays = statusDto.actualDays;
        if (statusDto.workStatus === client_1.DepartmentWorkStatus.COMPLETED &&
            statusDto.workStartDate && statusDto.workEndDate) {
            const startDate = new Date(statusDto.workStartDate);
            const endDate = new Date(statusDto.workEndDate);
            actualDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedHistory = await tx.projectDepartmentHistory.update({
                where: { id: currentDepartmentHistory.id },
                data: {
                    workStatus: statusDto.workStatus,
                    workStartDate: statusDto.workStartDate ? new Date(statusDto.workStartDate) : undefined,
                    workEndDate: statusDto.workEndDate ? new Date(statusDto.workEndDate) : undefined,
                    actualDays,
                    notes: statusDto.notes || currentDepartmentHistory.notes,
                },
            });
            if (statusDto.workStatus === client_1.DepartmentWorkStatus.COMPLETED) {
                const allHistory = await tx.projectDepartmentHistory.findMany({
                    where: { projectId },
                    orderBy: { createdAt: 'asc' },
                });
                const newProjectCode = (0, project_code_util_1.generateProjectCode)(allHistory);
                await tx.project.update({
                    where: { id: projectId },
                    data: { projectCode: newProjectCode },
                });
            }
            return tx.projectDepartmentHistory.findUnique({
                where: { id: updatedHistory.id },
                include: {
                    movedBy: {
                        select: { id: true, name: true, email: true, role: true },
                    },
                    permissionGrantedBy: {
                        select: { id: true, name: true, email: true, role: true },
                    },
                    corrections: {
                        include: {
                            requestedBy: {
                                select: { id: true, name: true, email: true, role: true },
                            },
                            assignedTo: {
                                select: { id: true, name: true, email: true, role: true },
                            },
                        },
                        orderBy: { requestedAt: 'desc' },
                    },
                },
            });
        });
    }
    async createCorrection(projectId, historyId, correctionDto, user) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        const departmentHistory = await this.prisma.projectDepartmentHistory.findUnique({
            where: { id: historyId },
        });
        if (!departmentHistory || departmentHistory.projectId !== projectId) {
            throw new common_1.NotFoundException('Department history not found for this project');
        }
        return this.prisma.$transaction(async (tx) => {
            const correction = await tx.departmentCorrection.create({
                data: {
                    historyId,
                    correctionType: correctionDto.correctionType,
                    description: correctionDto.description,
                    requestedById: user.id,
                    assignedToId: correctionDto.assignedToId,
                    priority: correctionDto.priority || 'MEDIUM',
                    estimatedHours: correctionDto.estimatedHours,
                },
                include: {
                    requestedBy: {
                        select: { id: true, name: true, email: true, role: true },
                    },
                    assignedTo: {
                        select: { id: true, name: true, email: true, role: true },
                    },
                },
            });
            await tx.projectDepartmentHistory.update({
                where: { id: historyId },
                data: {
                    correctionCount: { increment: 1 },
                    workStatus: client_1.DepartmentWorkStatus.CORRECTIONS_NEEDED,
                },
            });
            return correction;
        });
    }
    async getProjectCorrections(projectId, user) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        if (user.role === client_1.Role.CLIENT && project.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied to this project');
        }
        return this.prisma.departmentCorrection.findMany({
            where: {
                departmentHistory: {
                    projectId,
                },
            },
            include: {
                requestedBy: {
                    select: { id: true, name: true, email: true, role: true },
                },
                assignedTo: {
                    select: { id: true, name: true, email: true, role: true },
                },
                departmentHistory: {
                    select: {
                        toDepartment: true,
                        fromDepartment: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { requestedAt: 'desc' },
        });
    }
    async updateCorrection(projectId, correctionId, updateDto, user) {
        const correction = await this.prisma.departmentCorrection.findUnique({
            where: { id: correctionId },
            include: {
                departmentHistory: true,
            },
        });
        if (!correction || correction.departmentHistory.projectId !== projectId) {
            throw new common_1.NotFoundException('Correction not found for this project');
        }
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (user.role === client_1.Role.CLIENT && project.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied to this correction');
        }
        const updateData = { ...updateDto };
        if (updateDto.status === client_1.CorrectionStatus.RESOLVED) {
            updateData.resolvedAt = new Date();
        }
        return this.prisma.departmentCorrection.update({
            where: { id: correctionId },
            data: updateData,
            include: {
                requestedBy: {
                    select: { id: true, name: true, email: true, role: true },
                },
                assignedTo: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
    }
    async getTimelineAnalytics(projectId, user) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                departmentHistory: {
                    include: {
                        corrections: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        if (user.role === client_1.Role.CLIENT && project.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied to this project');
        }
        const departmentBreakdown = project.departmentHistory.map(history => {
            const efficiency = history.estimatedDays && history.actualDays
                ? Math.round((history.estimatedDays / history.actualDays) * 100)
                : 0;
            return {
                department: history.toDepartment,
                estimatedDays: history.estimatedDays,
                actualDays: history.actualDays,
                workStartDate: history.workStartDate?.toISOString(),
                workEndDate: history.workEndDate?.toISOString(),
                correctionCount: history.correctionCount,
                status: history.workStatus,
                efficiency,
            };
        });
        const totalCorrections = project.departmentHistory.reduce((sum, history) => sum + history.correctionCount, 0);
        const completedDepartments = project.departmentHistory.filter(h => h.workStatus === client_1.DepartmentWorkStatus.COMPLETED && h.actualDays);
        const totalDuration = completedDepartments.reduce((sum, h) => sum + (h.actualDays || 0), 0);
        const averageResolutionTime = project.departmentHistory
            .flatMap(h => h.corrections)
            .filter(c => c.status === client_1.CorrectionStatus.RESOLVED && c.actualHours)
            .reduce((sum, c, _, arr) => sum + (c.actualHours || 0) / arr.length, 0);
        const estimateAccuracy = departmentBreakdown
            .filter(d => d.efficiency > 0)
            .reduce((sum, d, _, arr) => sum + d.efficiency / arr.length, 0);
        const bottlenecks = departmentBreakdown
            .filter(d => d.efficiency < 80 && d.actualDays && d.estimatedDays)
            .map(d => d.department);
        return {
            projectId,
            totalDuration,
            departmentBreakdown,
            totalCorrections,
            averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
            estimateAccuracy: Math.round(estimateAccuracy),
            bottlenecks,
        };
    }
    async requestApproval(projectId, historyId, approvalType, user) {
        const history = await this.prisma.projectDepartmentHistory.findUnique({
            where: { id: historyId },
        });
        if (!history || history.projectId !== projectId) {
            throw new common_1.NotFoundException('Department history not found');
        }
        return this.prisma.workflowApproval.create({
            data: {
                historyId,
                approvalType,
                requestedById: user.id,
            },
            include: {
                requestedBy: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
    }
    async submitApproval(approvalId, status, comments, rejectionReason, user) {
        const approval = await this.prisma.workflowApproval.findUnique({
            where: { id: approvalId },
            include: { departmentHistory: true },
        });
        if (!approval) {
            throw new common_1.NotFoundException('Approval not found');
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedApproval = await tx.workflowApproval.update({
                where: { id: approvalId },
                data: {
                    status,
                    reviewedById: user?.id,
                    reviewedAt: new Date(),
                    comments,
                    rejectionReason,
                },
                include: {
                    requestedBy: { select: { id: true, name: true, email: true, role: true } },
                    reviewedBy: { select: { id: true, name: true, email: true, role: true } },
                },
            });
            let newWorkStatus;
            if (status === client_1.ApprovalStatus.APPROVED) {
                newWorkStatus = client_1.DepartmentWorkStatus.COMPLETED;
            }
            else if (status === client_1.ApprovalStatus.REJECTED) {
                newWorkStatus = approval.approvalType === client_1.ApprovalType.CLIENT_APPROVAL
                    ? client_1.DepartmentWorkStatus.CLIENT_REJECTED
                    : client_1.DepartmentWorkStatus.QA_REJECTED;
            }
            else {
                newWorkStatus = approval.departmentHistory.workStatus;
            }
            await tx.projectDepartmentHistory.update({
                where: { id: approval.historyId },
                data: { workStatus: newWorkStatus },
            });
            return updatedApproval;
        });
    }
    async startQATesting(projectId, historyId, qaType, testedById, user) {
        const history = await this.prisma.projectDepartmentHistory.findUnique({
            where: { id: historyId },
            include: { qaRounds: { orderBy: { roundNumber: 'desc' } } },
        });
        if (!history || history.projectId !== projectId) {
            throw new common_1.NotFoundException('Department history not found');
        }
        const nextRoundNumber = (history.qaRounds[0]?.roundNumber || 0) + 1;
        return this.prisma.$transaction(async (tx) => {
            await tx.projectDepartmentHistory.update({
                where: { id: historyId },
                data: { workStatus: client_1.DepartmentWorkStatus.QA_TESTING },
            });
            return tx.qATestingRound.create({
                data: {
                    historyId,
                    roundNumber: nextRoundNumber,
                    qaType,
                    testedById,
                },
                include: {
                    testedBy: {
                        select: { id: true, name: true, email: true, role: true },
                    },
                },
            });
        });
    }
    async completeQATestingRound(qaRoundId, status, bugsFound, criticalBugs, testResults, rejectionReason) {
        const qaRound = await this.prisma.qATestingRound.findUnique({
            where: { id: qaRoundId },
            include: { departmentHistory: true },
        });
        if (!qaRound) {
            throw new common_1.NotFoundException('QA testing round not found');
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedRound = await tx.qATestingRound.update({
                where: { id: qaRoundId },
                data: {
                    status,
                    completedAt: new Date(),
                    bugsFound,
                    criticalBugs,
                    testResults,
                    rejectionReason,
                },
                include: {
                    testedBy: { select: { id: true, name: true, email: true, role: true } },
                    bugs: true,
                },
            });
            let newWorkStatus;
            if (status === client_1.QAStatus.PASSED) {
                if (qaRound.qaType === client_1.QAType.BEFORE_LIVE_QA) {
                    newWorkStatus = client_1.DepartmentWorkStatus.READY_FOR_DELIVERY;
                }
                else {
                    newWorkStatus = client_1.DepartmentWorkStatus.COMPLETED;
                }
            }
            else if (status === client_1.QAStatus.FAILED) {
                newWorkStatus = criticalBugs > 0 ? client_1.DepartmentWorkStatus.QA_REJECTED : client_1.DepartmentWorkStatus.BUGFIX_IN_PROGRESS;
            }
            else {
                newWorkStatus = qaRound.departmentHistory.workStatus;
            }
            await tx.projectDepartmentHistory.update({
                where: { id: qaRound.historyId },
                data: { workStatus: newWorkStatus },
            });
            return updatedRound;
        });
    }
    async createQABug(qaRoundId, bugData, user) {
        const qaRound = await this.prisma.qATestingRound.findUnique({
            where: { id: qaRoundId },
            include: {
                departmentHistory: {
                    include: { project: true }
                }
            }
        });
        if (!qaRound) {
            throw new common_1.NotFoundException('QA testing round not found');
        }
        const targetDepartments = this.workflowRules.getBugFixDepartment(bugData.description || '', bugData.title || '');
        let assignedDepartment;
        const project = qaRound.departmentHistory.project;
        if (targetDepartments.includes(client_1.Department.HTML)) {
            assignedDepartment = client_1.Department.HTML;
        }
        else if (project.category.includes('PHP') && targetDepartments.includes(client_1.Department.PHP)) {
            assignedDepartment = client_1.Department.PHP;
        }
        else if (targetDepartments.includes(client_1.Department.REACT)) {
            assignedDepartment = client_1.Department.REACT;
        }
        else {
            assignedDepartment = client_1.Department.HTML;
        }
        return this.prisma.qABug.create({
            data: {
                qaRoundId,
                ...bugData,
                steps: bugData.steps ?
                    `${bugData.steps}\n\n[Auto-assigned to ${assignedDepartment} based on bug analysis]` :
                    `[Auto-assigned to ${assignedDepartment} based on bug analysis]`
            },
            include: {
                assignedTo: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
    }
    async getWorkflowStatus(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                departmentHistory: {
                    include: {
                        approvals: {
                            include: {
                                requestedBy: { select: { id: true, name: true, email: true, role: true } },
                                reviewedBy: { select: { id: true, name: true, email: true, role: true } },
                            },
                        },
                        qaRounds: {
                            include: {
                                testedBy: { select: { id: true, name: true, email: true, role: true } },
                                bugs: {
                                    include: {
                                        assignedTo: { select: { id: true, name: true, email: true, role: true } },
                                    },
                                },
                            },
                            orderBy: { roundNumber: 'desc' },
                        },
                        corrections: {
                            include: {
                                requestedBy: { select: { id: true, name: true, email: true, role: true } },
                                assignedTo: { select: { id: true, name: true, email: true, role: true } },
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        return project;
    }
    async getAllowedNextDepartments(projectId, user) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        return this.workflowRules.getAllowedNextDepartments(project.currentDepartment);
    }
    async getWorkflowValidationStatus(projectId, user) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        const allowedDepartments = this.workflowRules.getAllowedNextDepartments(project.currentDepartment);
        const workflowSequence = this.workflowRules.getWorkflowSequence(project.category);
        const currentHistory = await this.prisma.projectDepartmentHistory.findFirst({
            where: {
                projectId: projectId,
                toDepartment: project.currentDepartment
            },
            include: {
                approvals: true,
                qaRounds: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        const currentStatus = currentHistory?.workStatus || client_1.DepartmentWorkStatus.NOT_STARTED;
        const approvals = currentHistory?.approvals || [];
        const qaRounds = currentHistory?.qaRounds || [];
        const approvalGate = this.workflowRules.getApprovalGate(project.currentDepartment);
        const gateStatus = approvalGate ?
            this.workflowRules.areApprovalGatesSatisfied(project.currentDepartment, currentStatus, approvals.map(a => ({ approvalType: a.approvalType, status: a.status })), qaRounds.map(qa => ({ status: qa.status }))) : { satisfied: true, missingRequirements: [] };
        return {
            currentDepartment: project.currentDepartment,
            currentStatus,
            allowedNextDepartments: allowedDepartments,
            workflowSequence,
            approvalGate: {
                required: !!approvalGate,
                satisfied: gateStatus.satisfied,
                missingRequirements: gateStatus.missingRequirements,
            },
            canProceed: gateStatus.satisfied && allowedDepartments.length > 0,
        };
    }
    async requestManagerReview(projectId, reason, user) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                departmentHistory: {
                    include: {
                        qaRounds: {
                            include: { bugs: true }
                        }
                    }
                }
            }
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        const totalRejections = project.departmentHistory.filter(h => h.workStatus === client_1.DepartmentWorkStatus.QA_REJECTED ||
            h.workStatus === client_1.DepartmentWorkStatus.CLIENT_REJECTED).length;
        const totalCriticalBugs = project.departmentHistory
            .flatMap(h => h.qaRounds)
            .reduce((sum, qa) => sum + qa.criticalBugs, 0);
        if (!this.workflowRules.requiresManagerReview(totalRejections, totalCriticalBugs)) {
            throw new common_1.BadRequestException('Manager review not required for this project');
        }
        const currentHistory = await this.prisma.projectDepartmentHistory.findFirst({
            where: {
                projectId: projectId,
                toDepartment: project.currentDepartment
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!currentHistory) {
            throw new common_1.NotFoundException('Current department history not found');
        }
        return this.prisma.workflowApproval.create({
            data: {
                historyId: currentHistory.id,
                approvalType: client_1.ApprovalType.MANAGER_REVIEW,
                requestedById: user.id,
                comments: `Manager review requested: ${reason}`,
            },
            include: {
                requestedBy: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
    }
    async submitManagerReview(approvalId, decision, comments, user) {
        if (user.role !== client_1.Role.PROJECT_MANAGER && user.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only managers can submit manager reviews');
        }
        const approval = await this.prisma.workflowApproval.findUnique({
            where: { id: approvalId },
            include: {
                departmentHistory: {
                    include: { project: true }
                }
            },
        });
        if (!approval) {
            throw new common_1.NotFoundException('Manager review not found');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.workflowApproval.update({
                where: { id: approvalId },
                data: {
                    status: decision === 'PROCEED' ? client_1.ApprovalStatus.APPROVED : client_1.ApprovalStatus.REJECTED,
                    reviewedById: user.id,
                    reviewedAt: new Date(),
                    comments,
                    rejectionReason: decision === 'CANCEL' ? 'Project cancelled by management' : undefined,
                },
            });
            let newStatus;
            let newWorkStatus;
            switch (decision) {
                case 'PROCEED':
                    newStatus = client_1.ProjectStatus.ACTIVE;
                    newWorkStatus = client_1.DepartmentWorkStatus.READY_FOR_DELIVERY;
                    break;
                case 'REVISE':
                    newStatus = client_1.ProjectStatus.ACTIVE;
                    newWorkStatus = client_1.DepartmentWorkStatus.CORRECTIONS_NEEDED;
                    break;
                case 'CANCEL':
                    newStatus = client_1.ProjectStatus.CANCELLED;
                    newWorkStatus = approval.departmentHistory.workStatus;
                    break;
            }
            const updatedProject = await tx.project.update({
                where: { id: approval.departmentHistory.projectId },
                data: { status: newStatus },
            });
            await tx.projectDepartmentHistory.update({
                where: { id: approval.historyId },
                data: { workStatus: newWorkStatus },
            });
            return updatedProject;
        });
    }
    async reassignPCOrTL(projectId, reassignDto, user) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                projectCoordinator: true,
                pcTeamLead: true,
            },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        const userDepartment = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { departmentMaster: true }
        });
        const isPMOUser = userDepartment?.departmentMaster?.code === 'PMO';
        if (user.role !== client_1.Role.ADMIN && user.role !== client_1.Role.PROJECT_MANAGER && !isPMOUser) {
            throw new common_1.ForbiddenException('You do not have permission to reassign project coordinators');
        }
        const assignmentType = reassignDto.assignmentType === 'PROJECT_COORDINATOR'
            ? client_1.ProjectAssignmentType.PROJECT_COORDINATOR
            : client_1.ProjectAssignmentType.PC_TEAM_LEAD;
        const currentUserId = reassignDto.assignmentType === 'PROJECT_COORDINATOR'
            ? project.projectCoordinatorId
            : project.pcTeamLeadId;
        const newUser = await this.prisma.user.findUnique({
            where: { id: reassignDto.newUserId },
            include: { roleMaster: true, departmentMaster: true }
        });
        if (!newUser) {
            throw new common_1.NotFoundException('User not found');
        }
        if (newUser.departmentMaster?.code !== 'PMO') {
            throw new common_1.BadRequestException('User must be in PMO department');
        }
        if (reassignDto.assignmentType === 'PROJECT_COORDINATOR') {
            if (newUser.roleMaster?.code !== 'PC') {
                throw new common_1.BadRequestException('User must have PC role for this assignment');
            }
        }
        else {
            if (!['PC_TL1', 'PC_TL2'].includes(newUser.roleMaster?.code || '')) {
                throw new common_1.BadRequestException('User must have PC_TL1 or PC_TL2 role for this assignment');
            }
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.projectAssignmentHistory.create({
                data: {
                    projectId,
                    assignmentType,
                    previousUserId: currentUserId,
                    newUserId: reassignDto.newUserId,
                    assignedById: user.id,
                    reason: reassignDto.reason || 'Manual reassignment',
                    notes: reassignDto.notes,
                },
            });
            const updateData = {};
            if (reassignDto.assignmentType === 'PROJECT_COORDINATOR') {
                updateData.projectCoordinatorId = reassignDto.newUserId;
            }
            else {
                updateData.pcTeamLeadId = reassignDto.newUserId;
            }
            return tx.project.update({
                where: { id: projectId },
                data: updateData,
                include: {
                    owner: {
                        select: { id: true, name: true, email: true, role: true },
                    },
                    projectCoordinator: {
                        select: { id: true, name: true, email: true, role: true },
                    },
                    pcTeamLead: {
                        select: { id: true, name: true, email: true, role: true },
                    },
                },
            });
        });
    }
    async getAssignmentHistory(projectId, user) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        if (user.role === client_1.Role.CLIENT && project.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied to this project');
        }
        return this.prisma.projectAssignmentHistory.findMany({
            where: { projectId },
            include: {
                previousUser: {
                    select: { id: true, name: true, email: true, role: true },
                },
                assignedBy: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
            orderBy: { assignedAt: 'desc' },
        });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_rules_service_1.WorkflowRulesService,
        workflow_validator_service_1.WorkflowValidatorService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map