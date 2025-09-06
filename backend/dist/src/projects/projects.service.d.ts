import { PrismaService } from '../database/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateDepartmentTransitionDto } from './dto/create-department-transition.dto';
import { UpdateDepartmentWorkStatusDto } from './dto/update-department-work-status.dto';
import { UpdateChecklistItemDto, CreateChecklistItemLinkDto, CreateChecklistItemUpdateDto } from './dto/update-checklist-item.dto';
import { DisableProjectDto } from './dto/disable-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { User, Role } from '@prisma/client';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProjectDto: CreateProjectDto, user: User): Promise<{
        _count: {
            comments: number;
            tasks: number;
        };
        owner: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        projectCoordinator: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        pcTeamLead: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
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
    }>;
    findAll(userId?: string, role?: Role, user?: User): Promise<({
        _count: {
            comments: number;
            tasks: number;
        };
        owner: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        projectCoordinator: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
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
    })[]>;
    findOne(id: string, user: User): Promise<{
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
        customFields: {
            id: string;
            projectId: string;
            fieldName: string;
            fieldValue: string;
        }[];
        departmentHistory: ({
            corrections: ({
                assignedTo: {
                    id: string;
                    name: string;
                    email: string;
                    role: import(".prisma/client").$Enums.Role;
                };
                requestedBy: {
                    id: string;
                    name: string;
                    email: string;
                    role: import(".prisma/client").$Enums.Role;
                };
            } & {
                id: string;
                description: string;
                status: import(".prisma/client").$Enums.CorrectionStatus;
                priority: import(".prisma/client").$Enums.Priority;
                historyId: string;
                correctionType: string;
                requestedById: string;
                assignedToId: string | null;
                requestedAt: Date;
                resolvedAt: Date | null;
                resolutionNotes: string | null;
                estimatedHours: number | null;
                actualHours: number | null;
            })[];
            movedBy: {
                id: string;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
            };
            permissionGrantedBy: {
                id: string;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
            };
            qaRounds: ({
                bugs: ({
                    assignedTo: {
                        id: string;
                        name: string;
                        email: string;
                        role: import(".prisma/client").$Enums.Role;
                    };
                } & {
                    id: string;
                    description: string;
                    status: import(".prisma/client").$Enums.BugStatus;
                    title: string;
                    assignedToId: string | null;
                    qaRoundId: string;
                    severity: import(".prisma/client").$Enums.BugSeverity;
                    foundAt: Date;
                    fixedAt: Date | null;
                    screenshot: string | null;
                    steps: string | null;
                })[];
                testedBy: {
                    id: string;
                    name: string;
                    email: string;
                    role: import(".prisma/client").$Enums.Role;
                };
            } & {
                id: string;
                status: import(".prisma/client").$Enums.QAStatus;
                historyId: string;
                roundNumber: number;
                qaType: import(".prisma/client").$Enums.QAType;
                startedAt: Date;
                completedAt: Date | null;
                testedById: string;
                bugsFound: number;
                criticalBugs: number;
                testResults: string | null;
                rejectionReason: string | null;
            })[];
            approvals: ({
                requestedBy: {
                    id: string;
                    name: string;
                    email: string;
                    role: import(".prisma/client").$Enums.Role;
                };
                reviewedBy: {
                    id: string;
                    name: string;
                    email: string;
                    role: import(".prisma/client").$Enums.Role;
                };
            } & {
                id: string;
                comments: string | null;
                status: import(".prisma/client").$Enums.ApprovalStatus;
                historyId: string;
                requestedById: string;
                requestedAt: Date;
                rejectionReason: string | null;
                approvalType: import(".prisma/client").$Enums.ApprovalType;
                reviewedById: string | null;
                reviewedAt: Date | null;
                attachments: string[];
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            fromDepartment: import(".prisma/client").$Enums.Department | null;
            toDepartment: import(".prisma/client").$Enums.Department;
            movedById: string;
            notes: string | null;
            workStatus: import(".prisma/client").$Enums.DepartmentWorkStatus;
            workStartDate: Date | null;
            workEndDate: Date | null;
            estimatedDays: number | null;
            actualDays: number | null;
            correctionCount: number;
            permissionGrantedById: string | null;
        })[];
        owner: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        tasks: ({
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
        })[];
    } & {
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
    }>;
    update(id: string, updateProjectDto: UpdateProjectDto, user: User): Promise<{
        _count: {
            comments: number;
            tasks: number;
        };
        owner: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
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
    }>;
    remove(id: string, user: User): Promise<{
        message: string;
    }>;
    addCustomField(projectId: string, fieldName: string, fieldValue: string, user: User): Promise<{
        id: string;
        projectId: string;
        fieldName: string;
        fieldValue: string;
    }>;
    moveToDepartment(projectId: string, transitionDto: CreateDepartmentTransitionDto, user: User): Promise<{
        _count: {
            comments: number;
            tasks: number;
        };
        departmentHistory: ({
            movedBy: {
                id: string;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            fromDepartment: import(".prisma/client").$Enums.Department | null;
            toDepartment: import(".prisma/client").$Enums.Department;
            movedById: string;
            notes: string | null;
            workStatus: import(".prisma/client").$Enums.DepartmentWorkStatus;
            workStartDate: Date | null;
            workEndDate: Date | null;
            estimatedDays: number | null;
            actualDays: number | null;
            correctionCount: number;
            permissionGrantedById: string | null;
        })[];
        owner: {
            id: string;
            name: string;
            department: import(".prisma/client").$Enums.Department;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
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
    }>;
    getDepartmentHistory(projectId: string, user: User): Promise<({
        movedBy: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        fromDepartment: import(".prisma/client").$Enums.Department | null;
        toDepartment: import(".prisma/client").$Enums.Department;
        movedById: string;
        notes: string | null;
        workStatus: import(".prisma/client").$Enums.DepartmentWorkStatus;
        workStartDate: Date | null;
        workEndDate: Date | null;
        estimatedDays: number | null;
        actualDays: number | null;
        correctionCount: number;
        permissionGrantedById: string | null;
    })[]>;
    updateDepartmentWorkStatus(projectId: string, statusDto: UpdateDepartmentWorkStatusDto, user: User): Promise<{
        corrections: ({
            assignedTo: {
                id: string;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
            };
            requestedBy: {
                id: string;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            description: string;
            status: import(".prisma/client").$Enums.CorrectionStatus;
            priority: import(".prisma/client").$Enums.Priority;
            historyId: string;
            correctionType: string;
            requestedById: string;
            assignedToId: string | null;
            requestedAt: Date;
            resolvedAt: Date | null;
            resolutionNotes: string | null;
            estimatedHours: number | null;
            actualHours: number | null;
        })[];
        movedBy: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        permissionGrantedBy: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        fromDepartment: import(".prisma/client").$Enums.Department | null;
        toDepartment: import(".prisma/client").$Enums.Department;
        movedById: string;
        notes: string | null;
        workStatus: import(".prisma/client").$Enums.DepartmentWorkStatus;
        workStartDate: Date | null;
        workEndDate: Date | null;
        estimatedDays: number | null;
        actualDays: number | null;
        correctionCount: number;
        permissionGrantedById: string | null;
    }>;
    getChecklistProgress(projectId: string, department?: string, user?: User): Promise<{
        department: string;
        totalItems: number;
        completedItems: number;
        requiredItems: number;
        completedRequiredItems: number;
        completionPercentage: number;
        requiredCompletionPercentage: number;
        canProceedToNext: boolean;
        items: ({
            links: ({
                addedBy: {
                    id: string;
                    name: string;
                    email: string;
                };
            } & {
                id: string;
                title: string;
                type: string;
                itemId: string;
                url: string;
                addedAt: Date;
                addedById: string | null;
            })[];
            template: {
                id: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                department: string;
                order: number;
                title: string;
                isRequired: boolean;
            };
            completedBy: {
                id: string;
                name: string;
                email: string;
            };
            lastUpdatedBy: {
                id: string;
                name: string;
                email: string;
            };
            updateHistory: ({
                updatedBy: {
                    id: string;
                    name: string;
                    email: string;
                };
            } & {
                id: string;
                updatedAt: Date;
                notes: string;
                itemId: string;
                date: Date;
                updatedById: string;
            })[];
        } & {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            department: import(".prisma/client").$Enums.Department;
            order: number;
            projectId: string;
            title: string;
            notes: string | null;
            completedAt: Date | null;
            templateId: string;
            isCompleted: boolean;
            completedById: string | null;
            completedDate: Date | null;
            isRequired: boolean;
            lastUpdatedAt: Date | null;
            lastUpdatedById: string | null;
        })[];
    }>;
    updateChecklistItem(projectId: string, itemId: string, data: UpdateChecklistItemDto, user: User): Promise<{
        links: ({
            addedBy: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            title: string;
            type: string;
            itemId: string;
            url: string;
            addedAt: Date;
            addedById: string | null;
        })[];
        template: {
            id: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            department: string;
            order: number;
            title: string;
            isRequired: boolean;
        };
        completedBy: {
            id: string;
            name: string;
            email: string;
        };
        lastUpdatedBy: {
            id: string;
            name: string;
            email: string;
        };
        updateHistory: ({
            updatedBy: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            updatedAt: Date;
            notes: string;
            itemId: string;
            date: Date;
            updatedById: string;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        department: import(".prisma/client").$Enums.Department;
        order: number;
        projectId: string;
        title: string;
        notes: string | null;
        completedAt: Date | null;
        templateId: string;
        isCompleted: boolean;
        completedById: string | null;
        completedDate: Date | null;
        isRequired: boolean;
        lastUpdatedAt: Date | null;
        lastUpdatedById: string | null;
    }>;
    addChecklistItemLink(projectId: string, itemId: string, linkData: CreateChecklistItemLinkDto, user: User): Promise<{
        addedBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        title: string;
        type: string;
        itemId: string;
        url: string;
        addedAt: Date;
        addedById: string | null;
    }>;
    removeChecklistItemLink(projectId: string, itemId: string, linkId: string, user: User): Promise<{
        success: boolean;
    }>;
    addChecklistItemUpdate(projectId: string, itemId: string, updateData: CreateChecklistItemUpdateDto, user: User): Promise<{
        updatedBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        notes: string;
        itemId: string;
        date: Date;
        updatedById: string;
    }>;
    updateProjectStatus(id: string, updateStatusDto: UpdateProjectStatusDto, user: User): Promise<{
        _count: {
            comments: number;
            tasks: number;
        };
        owner: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        projectCoordinator: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
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
    }>;
    disableProject(id: string, disableDto: DisableProjectDto, user: User): Promise<{
        _count: {
            comments: number;
            tasks: number;
        };
        owner: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        disabledByUser: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
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
    }>;
}
