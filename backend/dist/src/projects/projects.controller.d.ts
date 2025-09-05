import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddCustomFieldDto } from './dto/add-custom-field.dto';
import { CreateDepartmentTransitionDto } from './dto/create-department-transition.dto';
import { UpdateDepartmentWorkStatusDto } from './dto/update-department-work-status.dto';
import { UpdateChecklistItemDto, CreateChecklistItemLinkDto, CreateChecklistItemUpdateDto } from './dto/update-checklist-item.dto';
import { DisableProjectDto } from './dto/disable-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { User as UserEntity } from '@prisma/client';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: CreateProjectDto, user: UserEntity): Promise<{
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
        _count: {
            comments: number;
            tasks: number;
        };
    } & {
        id: string;
        name: string;
        office: string;
        category: import(".prisma/client").$Enums.ProjectCategory;
        pagesCount: number | null;
        targetDate: Date;
        status: import(".prisma/client").$Enums.ProjectStatus;
        clientName: string | null;
        observations: string | null;
        monthsPassed: number;
        startDate: Date;
        deviationReason: string | null;
        dependency: boolean;
        disabled: boolean;
        disabledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        ownerId: string;
        disabledBy: string | null;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
    findAll(user: UserEntity): Promise<({
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
        _count: {
            comments: number;
            tasks: number;
        };
    } & {
        id: string;
        name: string;
        office: string;
        category: import(".prisma/client").$Enums.ProjectCategory;
        pagesCount: number | null;
        targetDate: Date;
        status: import(".prisma/client").$Enums.ProjectStatus;
        clientName: string | null;
        observations: string | null;
        monthsPassed: number;
        startDate: Date;
        deviationReason: string | null;
        dependency: boolean;
        disabled: boolean;
        disabledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        ownerId: string;
        disabledBy: string | null;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    })[]>;
    findOne(id: string, user: UserEntity): Promise<{
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
                status: import(".prisma/client").$Enums.CorrectionStatus;
                requestedAt: Date;
                historyId: string;
                correctionType: string;
                description: string;
                requestedById: string;
                assignedToId: string | null;
                priority: import(".prisma/client").$Enums.Priority;
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
                    status: import(".prisma/client").$Enums.BugStatus;
                    description: string;
                    assignedToId: string | null;
                    foundAt: Date;
                    qaRoundId: string;
                    title: string;
                    severity: import(".prisma/client").$Enums.BugSeverity;
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
                rejectionReason: string | null;
                roundNumber: number;
                qaType: import(".prisma/client").$Enums.QAType;
                startedAt: Date;
                completedAt: Date | null;
                testedById: string;
                bugsFound: number;
                criticalBugs: number;
                testResults: string | null;
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
                status: import(".prisma/client").$Enums.ApprovalStatus;
                comments: string | null;
                requestedAt: Date;
                historyId: string;
                requestedById: string;
                approvalType: import(".prisma/client").$Enums.ApprovalType;
                reviewedById: string | null;
                reviewedAt: Date | null;
                rejectionReason: string | null;
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
            status: import(".prisma/client").$Enums.TaskStatus;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            description: string | null;
            priority: import(".prisma/client").$Enums.Priority;
            title: string;
            dueDate: Date | null;
            assigneeId: string | null;
        })[];
    } & {
        id: string;
        name: string;
        office: string;
        category: import(".prisma/client").$Enums.ProjectCategory;
        pagesCount: number | null;
        targetDate: Date;
        status: import(".prisma/client").$Enums.ProjectStatus;
        clientName: string | null;
        observations: string | null;
        monthsPassed: number;
        startDate: Date;
        deviationReason: string | null;
        dependency: boolean;
        disabled: boolean;
        disabledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        ownerId: string;
        disabledBy: string | null;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
    update(id: string, updateProjectDto: UpdateProjectDto, user: UserEntity): Promise<{
        owner: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        _count: {
            comments: number;
            tasks: number;
        };
    } & {
        id: string;
        name: string;
        office: string;
        category: import(".prisma/client").$Enums.ProjectCategory;
        pagesCount: number | null;
        targetDate: Date;
        status: import(".prisma/client").$Enums.ProjectStatus;
        clientName: string | null;
        observations: string | null;
        monthsPassed: number;
        startDate: Date;
        deviationReason: string | null;
        dependency: boolean;
        disabled: boolean;
        disabledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        ownerId: string;
        disabledBy: string | null;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
    remove(id: string, user: UserEntity): Promise<{
        message: string;
    }>;
    addCustomField(id: string, addCustomFieldDto: AddCustomFieldDto, user: UserEntity): Promise<{
        id: string;
        projectId: string;
        fieldName: string;
        fieldValue: string;
    }>;
    moveToDepartment(id: string, transitionDto: CreateDepartmentTransitionDto, user: UserEntity): Promise<{
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
            email: string;
            role: import(".prisma/client").$Enums.Role;
            department: import(".prisma/client").$Enums.Department;
        };
        _count: {
            comments: number;
            tasks: number;
        };
    } & {
        id: string;
        name: string;
        office: string;
        category: import(".prisma/client").$Enums.ProjectCategory;
        pagesCount: number | null;
        targetDate: Date;
        status: import(".prisma/client").$Enums.ProjectStatus;
        clientName: string | null;
        observations: string | null;
        monthsPassed: number;
        startDate: Date;
        deviationReason: string | null;
        dependency: boolean;
        disabled: boolean;
        disabledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        ownerId: string;
        disabledBy: string | null;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
    getDepartmentHistory(id: string, user: UserEntity): Promise<({
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
    updateDepartmentWorkStatus(id: string, statusDto: UpdateDepartmentWorkStatusDto, user: UserEntity): Promise<{
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
            status: import(".prisma/client").$Enums.CorrectionStatus;
            requestedAt: Date;
            historyId: string;
            correctionType: string;
            description: string;
            requestedById: string;
            assignedToId: string | null;
            priority: import(".prisma/client").$Enums.Priority;
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
    getChecklistProgress(projectId: string, department: string, user: UserEntity): Promise<{
        department: string;
        totalItems: number;
        completedItems: number;
        requiredItems: number;
        completedRequiredItems: number;
        completionPercentage: number;
        requiredCompletionPercentage: number;
        canProceedToNext: boolean;
        items: ({
            template: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                order: number;
                isActive: boolean;
                department: string;
                description: string | null;
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
            links: ({
                addedBy: {
                    id: string;
                    name: string;
                    email: string;
                };
            } & {
                id: string;
                title: string;
                itemId: string;
                url: string;
                type: string;
                addedAt: Date;
                addedById: string | null;
            })[];
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
            createdAt: Date;
            updatedAt: Date;
            order: number;
            department: import(".prisma/client").$Enums.Department;
            projectId: string;
            description: string | null;
            title: string;
            completedAt: Date | null;
            notes: string | null;
            templateId: string;
            isCompleted: boolean;
            completedById: string | null;
            completedDate: Date | null;
            isRequired: boolean;
            lastUpdatedAt: Date | null;
            lastUpdatedById: string | null;
        })[];
    }>;
    updateChecklistItem(projectId: string, itemId: string, updateDto: UpdateChecklistItemDto, user: UserEntity): Promise<{
        template: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            order: number;
            isActive: boolean;
            department: string;
            description: string | null;
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
        links: ({
            addedBy: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            title: string;
            itemId: string;
            url: string;
            type: string;
            addedAt: Date;
            addedById: string | null;
        })[];
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
        createdAt: Date;
        updatedAt: Date;
        order: number;
        department: import(".prisma/client").$Enums.Department;
        projectId: string;
        description: string | null;
        title: string;
        completedAt: Date | null;
        notes: string | null;
        templateId: string;
        isCompleted: boolean;
        completedById: string | null;
        completedDate: Date | null;
        isRequired: boolean;
        lastUpdatedAt: Date | null;
        lastUpdatedById: string | null;
    }>;
    addChecklistItemLink(projectId: string, itemId: string, linkDto: CreateChecklistItemLinkDto, user: UserEntity): Promise<{
        addedBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        title: string;
        itemId: string;
        url: string;
        type: string;
        addedAt: Date;
        addedById: string | null;
    }>;
    removeChecklistItemLink(projectId: string, itemId: string, linkId: string, user: UserEntity): Promise<{
        success: boolean;
    }>;
    addChecklistItemUpdate(projectId: string, itemId: string, updateDto: CreateChecklistItemUpdateDto, user: UserEntity): Promise<{
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
    updateProjectStatus(id: string, updateStatusDto: UpdateProjectStatusDto, user: UserEntity): Promise<{
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
        _count: {
            comments: number;
            tasks: number;
        };
    } & {
        id: string;
        name: string;
        office: string;
        category: import(".prisma/client").$Enums.ProjectCategory;
        pagesCount: number | null;
        targetDate: Date;
        status: import(".prisma/client").$Enums.ProjectStatus;
        clientName: string | null;
        observations: string | null;
        monthsPassed: number;
        startDate: Date;
        deviationReason: string | null;
        dependency: boolean;
        disabled: boolean;
        disabledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        ownerId: string;
        disabledBy: string | null;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
    disableProject(id: string, disableDto: DisableProjectDto, user: UserEntity): Promise<{
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
        _count: {
            comments: number;
            tasks: number;
        };
    } & {
        id: string;
        name: string;
        office: string;
        category: import(".prisma/client").$Enums.ProjectCategory;
        pagesCount: number | null;
        targetDate: Date;
        status: import(".prisma/client").$Enums.ProjectStatus;
        clientName: string | null;
        observations: string | null;
        monthsPassed: number;
        startDate: Date;
        deviationReason: string | null;
        dependency: boolean;
        disabled: boolean;
        disabledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        ownerId: string;
        disabledBy: string | null;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
}
