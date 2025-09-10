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
const categories_service_1 = require("../categories/categories.service");
const client_1 = require("@prisma/client");
const project_code_util_1 = require("../utils/project-code.util");
let ProjectsService = class ProjectsService {
    constructor(prisma, categoriesService) {
        this.prisma = prisma;
        this.categoriesService = categoriesService;
    }
    async create(createProjectDto, user) {
        console.log('🔍 Creating project with data:', createProjectDto);
        console.log('🔍 User creating project:', user.id, user.name);
        let currentDepartment = null;
        let nextDepartment = null;
        let categoryMaster = null;
        if (createProjectDto.categoryMasterId) {
            categoryMaster = await this.categoriesService.findCategoryById(createProjectDto.categoryMasterId);
            const workflow = await this.categoriesService.getCategoryWorkflow(createProjectDto.categoryMasterId);
            if (workflow.departments.length > 0) {
                const firstDept = workflow.departments[0];
                currentDepartment = { code: firstDept.department };
                if (workflow.departments.length > 1) {
                    const secondDept = workflow.departments[1];
                    nextDepartment = { code: secondDept.department };
                }
            }
            else {
                currentDepartment = { code: categoryMaster.defaultStartDept };
            }
        }
        else if (createProjectDto.currentDepartmentId) {
            currentDepartment = await this.prisma.departmentMaster.findUnique({
                where: { id: createProjectDto.currentDepartmentId }
            });
            if (!currentDepartment) {
                throw new common_1.NotFoundException(`Current department with ID ${createProjectDto.currentDepartmentId} not found`);
            }
        }
        else {
            currentDepartment = { code: 'PMO' };
        }
        if (createProjectDto.nextDepartmentId) {
            nextDepartment = await this.prisma.departmentMaster.findUnique({
                where: { id: createProjectDto.nextDepartmentId }
            });
            if (!nextDepartment) {
                throw new common_1.NotFoundException(`Next department with ID ${createProjectDto.nextDepartmentId} not found`);
            }
        }
        const targetDate = createProjectDto.targetDate ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const project = await this.prisma.project.create({
            data: {
                name: createProjectDto.name,
                office: createProjectDto.office,
                category: createProjectDto.category || null,
                categoryMasterId: createProjectDto.categoryMasterId,
                pagesCount: createProjectDto.pagesCount,
                currentDepartment: currentDepartment.code,
                nextDepartment: nextDepartment?.code || undefined,
                targetDate: targetDate,
                status: createProjectDto.status || client_1.ProjectStatus.ACTIVE,
                clientName: createProjectDto.clientName,
                observations: createProjectDto.observations,
                deviationReason: createProjectDto.deviationReason,
                dependency: createProjectDto.dependency,
                startDate: createProjectDto.startDate,
                projectCoordinatorId: createProjectDto.projectCoordinatorId || null,
                pcTeamLeadId: createProjectDto.pcTeamLeadId || null,
                salesPersonId: createProjectDto.salesPersonId || null,
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
                categoryMaster: {
                    include: {
                        departmentMappings: {
                            where: { isActive: true },
                            orderBy: { sequence: 'asc' },
                        },
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
        try {
            if (createProjectDto.scheduleKTMeeting && createProjectDto.ktMeetingDate) {
                const ktMeeting = await this.prisma.kTMeeting.create({
                    data: {
                        projectId: project.id,
                        scheduledDate: new Date(createProjectDto.ktMeetingDate),
                        duration: createProjectDto.ktMeetingDuration || 60,
                        agenda: createProjectDto.ktMeetingAgenda || 'Project Knowledge Transfer Meeting',
                        meetingLink: createProjectDto.ktMeetingLink,
                        createdById: user.id,
                    },
                });
                if (createProjectDto.ktMeetingParticipants && createProjectDto.ktMeetingParticipants.length > 0) {
                    const participantData = createProjectDto.ktMeetingParticipants.map(userId => ({
                        meetingId: ktMeeting.id,
                        userId,
                        role: 'PARTICIPANT',
                        isRequired: true,
                    }));
                    await this.prisma.kTMeetingParticipant.createMany({
                        data: participantData,
                    });
                }
                const autoParticipants = [];
                if (createProjectDto.projectCoordinatorId) {
                    autoParticipants.push({
                        meetingId: ktMeeting.id,
                        userId: createProjectDto.projectCoordinatorId,
                        role: 'FACILITATOR',
                        isRequired: true,
                    });
                }
                if (createProjectDto.pcTeamLeadId && createProjectDto.pcTeamLeadId !== createProjectDto.projectCoordinatorId) {
                    autoParticipants.push({
                        meetingId: ktMeeting.id,
                        userId: createProjectDto.pcTeamLeadId,
                        role: 'TEAM_LEAD',
                        isRequired: true,
                    });
                }
                if (autoParticipants.length > 0) {
                    await this.prisma.kTMeetingParticipant.createMany({
                        data: autoParticipants,
                        skipDuplicates: true,
                    });
                }
                console.log('✅ KT Meeting created:', ktMeeting.id);
            }
        }
        catch (ktMeetingError) {
            console.error('❌ Failed to create KT meeting:', ktMeetingError);
        }
        return project;
    }
    async findAll(userId, role, user) {
        let where = {
            disabled: false,
        };
        const userWithDept = userId ? await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                departmentMaster: true,
                roleMaster: true,
            },
        }) : null;
        const roleCode = userWithDept?.roleMaster?.code || role?.toString();
        if (roleCode === 'CLIENT') {
            where = { ...where, ownerId: userId };
        }
        else if (roleCode === 'ADMIN' || roleCode === 'SU_ADMIN' || roleCode === 'PROJECT_MANAGER') {
            where = { disabled: false };
        }
        else if (userWithDept?.departmentMaster?.code === 'PMO') {
            where = {
                ...where,
                OR: [
                    { projectCoordinatorId: userId },
                    { pcTeamLeadId: userId },
                ],
            };
        }
        else if (userWithDept?.departmentMaster?.code) {
            where = {
                ...where,
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
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roleMaster: true }
        });
        const userRole = userWithRole?.roleMaster?.code || user.role?.toString();
        if (userRole === 'CLIENT' && project.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied to this project');
        }
        return project;
    }
    async update(id, updateProjectDto, user) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roleMaster: true }
        });
        const userRole = userWithRole?.roleMaster?.code || user.role?.toString();
        if (userRole === 'CLIENT' && project.ownerId !== user.id) {
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
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roleMaster: true }
        });
        const userRole = userWithRole?.roleMaster?.code || user.role?.toString();
        if (userRole !== 'ADMIN' && project.ownerId !== user.id) {
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
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roleMaster: true }
        });
        const userRole = userWithRole?.roleMaster?.code || user.role?.toString();
        if (userRole === 'CLIENT' && project.ownerId !== user.id) {
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
            let checklistProgress = null;
            try {
                checklistProgress = await this.getChecklistProgress(projectId, project.currentDepartment.toString(), user);
            }
            catch (error) {
                console.warn('Could not fetch checklist progress for history:', error.message);
            }
            const checklistInfo = checklistProgress ?
                `Checklist: ${checklistProgress.completedItems}/${checklistProgress.totalItems} items completed (${checklistProgress.completedRequiredItems}/${checklistProgress.requiredItems} required)` :
                null;
            let assignedToName = null;
            if (transitionDto.assignedToId) {
                const assignedUser = await tx.user.findUnique({
                    where: { id: transitionDto.assignedToId },
                    select: { name: true }
                });
                assignedToName = assignedUser?.name || transitionDto.assignedToId;
            }
            const enhancedNotes = [
                checklistInfo,
                transitionDto.notes,
                transitionDto.ktNotes ? `KT Notes: ${transitionDto.ktNotes}` : null,
                transitionDto.ktDocuments && transitionDto.ktDocuments.length > 0
                    ? `KT Documents: ${transitionDto.ktDocuments.join(', ')}` : null,
                transitionDto.expectedStartDate ? `Expected Start: ${transitionDto.expectedStartDate}` : null,
                transitionDto.expectedEndDate ? `Expected End: ${transitionDto.expectedEndDate}` : null,
                transitionDto.estimatedHours ? `Estimated Hours: ${transitionDto.estimatedHours}` : null,
                assignedToName ? `Assigned To: ${assignedToName}` : null,
            ].filter(Boolean).join(' | ');
            await tx.projectDepartmentHistory.create({
                data: {
                    projectId,
                    fromDepartment: project.currentDepartment,
                    toDepartment: transitionDto.toDepartment,
                    estimatedDays: transitionDto.estimatedDays,
                    workStatus: client_1.DepartmentWorkStatus.NOT_STARTED,
                    movedById: user.id,
                    permissionGrantedById: transitionDto.permissionGrantedById || user.id,
                    notes: enhancedNotes || transitionDto.notes,
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
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roleMaster: true }
        });
        const userRole = userWithRole?.roleMaster?.code || user.role?.toString();
        if (userRole === 'CLIENT' && project.ownerId !== user.id) {
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
    async getChecklistProgress(projectId, department, user) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        const targetDepartment = department || project.currentDepartment;
        let checklistItems = await this.prisma.projectChecklistItem.findMany({
            where: {
                projectId,
                department: targetDepartment
            },
            include: {
                template: true,
                completedBy: { select: { id: true, name: true, email: true } },
                lastUpdatedBy: { select: { id: true, name: true, email: true } },
                links: {
                    include: {
                        addedBy: { select: { id: true, name: true, email: true } }
                    }
                },
                updateHistory: {
                    include: {
                        updatedBy: { select: { id: true, name: true, email: true } }
                    },
                    orderBy: { updatedAt: 'desc' }
                }
            },
            orderBy: { order: 'asc' }
        });
        if (checklistItems.length === 0) {
            const templates = await this.prisma.checklistTemplate.findMany({
                where: {
                    department: targetDepartment,
                    isActive: true
                },
                orderBy: { order: 'asc' }
            });
            if (templates.length > 0) {
                const createData = templates.map(template => ({
                    projectId,
                    templateId: template.id,
                    department: targetDepartment,
                    title: template.title,
                    description: template.description,
                    isRequired: template.isRequired,
                    order: template.order
                }));
                await this.prisma.projectChecklistItem.createMany({
                    data: createData
                });
                checklistItems = await this.prisma.projectChecklistItem.findMany({
                    where: {
                        projectId,
                        department: targetDepartment
                    },
                    include: {
                        template: true,
                        completedBy: { select: { id: true, name: true, email: true } },
                        lastUpdatedBy: { select: { id: true, name: true, email: true } },
                        links: {
                            include: {
                                addedBy: { select: { id: true, name: true, email: true } }
                            }
                        },
                        updateHistory: {
                            include: {
                                updatedBy: { select: { id: true, name: true, email: true } }
                            },
                            orderBy: { updatedAt: 'desc' }
                        }
                    },
                    orderBy: { order: 'asc' }
                });
            }
        }
        const totalItems = checklistItems.length;
        const completedItems = checklistItems.filter(item => item.isCompleted).length;
        const requiredItems = checklistItems.filter(item => item.isRequired).length;
        const completedRequiredItems = checklistItems.filter(item => item.isCompleted && item.isRequired).length;
        return {
            department: targetDepartment,
            totalItems,
            completedItems,
            requiredItems,
            completedRequiredItems,
            completionPercentage: totalItems > 0 ? (completedItems / totalItems) * 100 : 0,
            requiredCompletionPercentage: requiredItems > 0 ? (completedRequiredItems / requiredItems) * 100 : 0,
            canProceedToNext: completedRequiredItems === requiredItems,
            items: checklistItems
        };
    }
    async updateChecklistItem(projectId, itemId, data, user) {
        const item = await this.prisma.projectChecklistItem.findUnique({
            where: { id: itemId, projectId }
        });
        if (!item) {
            throw new common_1.NotFoundException(`Checklist item with ID ${itemId} not found`);
        }
        const updateData = {
            isCompleted: data.isCompleted,
            notes: data.notes,
            lastUpdatedAt: new Date(),
            lastUpdatedById: user.id
        };
        if (data.isCompleted) {
            updateData.completedAt = new Date();
            updateData.completedById = user.id;
            if (data.completedDate) {
                updateData.completedDate = new Date(data.completedDate);
            }
        }
        else {
            updateData.completedAt = null;
            updateData.completedById = null;
            updateData.completedDate = null;
        }
        const updatedItem = await this.prisma.projectChecklistItem.update({
            where: { id: itemId },
            data: updateData,
            include: {
                template: true,
                completedBy: { select: { id: true, name: true, email: true } },
                lastUpdatedBy: { select: { id: true, name: true, email: true } },
                links: {
                    include: {
                        addedBy: { select: { id: true, name: true, email: true } }
                    }
                },
                updateHistory: {
                    include: {
                        updatedBy: { select: { id: true, name: true, email: true } }
                    },
                    orderBy: { updatedAt: 'desc' }
                }
            }
        });
        if (data.links) {
            await this.prisma.checklistItemLink.deleteMany({
                where: { itemId }
            });
            if (data.links.length > 0) {
                await this.prisma.checklistItemLink.createMany({
                    data: data.links.map(link => ({
                        itemId,
                        url: link.url,
                        title: link.title,
                        type: link.type,
                        addedById: user.id
                    }))
                });
            }
        }
        if (data.notes || data.isCompleted !== item.isCompleted) {
            await this.prisma.checklistItemUpdate.create({
                data: {
                    itemId,
                    date: data.completedDate ? new Date(data.completedDate) : new Date(),
                    notes: data.notes || `Item ${data.isCompleted ? 'completed' : 'unchecked'}`,
                    updatedById: user.id
                }
            });
        }
        return updatedItem;
    }
    async addChecklistItemLink(projectId, itemId, linkData, user) {
        const item = await this.prisma.projectChecklistItem.findUnique({
            where: { id: itemId, projectId }
        });
        if (!item) {
            throw new common_1.NotFoundException(`Checklist item with ID ${itemId} not found`);
        }
        return this.prisma.checklistItemLink.create({
            data: {
                itemId,
                url: linkData.url,
                title: linkData.title,
                type: linkData.type,
                addedById: user.id
            },
            include: {
                addedBy: { select: { id: true, name: true, email: true } }
            }
        });
    }
    async removeChecklistItemLink(projectId, itemId, linkId, user) {
        const item = await this.prisma.projectChecklistItem.findUnique({
            where: { id: itemId, projectId }
        });
        if (!item) {
            throw new common_1.NotFoundException(`Checklist item with ID ${itemId} not found`);
        }
        await this.prisma.checklistItemLink.delete({
            where: { id: linkId, itemId }
        });
        return { success: true };
    }
    async addChecklistItemUpdate(projectId, itemId, updateData, user) {
        const item = await this.prisma.projectChecklistItem.findUnique({
            where: { id: itemId, projectId }
        });
        if (!item) {
            throw new common_1.NotFoundException(`Checklist item with ID ${itemId} not found`);
        }
        return this.prisma.checklistItemUpdate.create({
            data: {
                itemId,
                date: new Date(updateData.date),
                notes: updateData.notes,
                updatedById: user.id
            },
            include: {
                updatedBy: { select: { id: true, name: true, email: true } }
            }
        });
    }
    async updateProjectStatus(id, updateStatusDto, user) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roleMaster: true }
        });
        const userRole = userWithRole?.roleMaster?.code || user.role?.toString();
        if (userRole !== 'ADMIN' && userRole !== 'SU_ADMIN') {
            throw new common_1.ForbiddenException('Only administrators can update project status');
        }
        return this.prisma.project.update({
            where: { id },
            data: {
                status: updateStatusDto.status,
                observations: updateStatusDto.reason ?
                    `${project.observations || ''}\n[Status Change ${new Date().toISOString()}]: ${updateStatusDto.reason}`.trim() :
                    project.observations,
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
                _count: {
                    select: {
                        tasks: true,
                        comments: true,
                    },
                },
            },
        });
    }
    async disableProject(id, disableDto, user) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roleMaster: true }
        });
        const userRole = userWithRole?.roleMaster?.code || user.role?.toString();
        if (userRole !== 'ADMIN' && userRole !== 'SU_ADMIN') {
            throw new common_1.ForbiddenException('Only administrators can disable/enable projects');
        }
        const updateData = {
            disabled: disableDto.disabled,
        };
        if (disableDto.disabled) {
            updateData.disabledAt = new Date();
            updateData.disabledBy = user.id;
            if (disableDto.reason) {
                updateData.observations = `${project.observations || ''}\n[Disabled ${new Date().toISOString()}]: ${disableDto.reason}`.trim();
            }
        }
        else {
            updateData.disabledAt = null;
            updateData.disabledBy = null;
            if (disableDto.reason) {
                updateData.observations = `${project.observations || ''}\n[Enabled ${new Date().toISOString()}]: ${disableDto.reason}`.trim();
            }
        }
        return this.prisma.project.update({
            where: { id },
            data: updateData,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                disabledByUser: {
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
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        categories_service_1.CategoriesService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map