import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddCustomFieldDto } from './dto/add-custom-field.dto';
import { CreateDepartmentTransitionDto } from './dto/create-department-transition.dto';
import { UpdateDepartmentWorkStatusDto } from './dto/update-department-work-status.dto';
import { CreateCorrectionDto } from './dto/create-correction.dto';
import { UpdateCorrectionDto } from './dto/update-correction.dto';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { CreateQATestingRoundDto } from './dto/create-qa-round.dto';
import { CreateQABugDto } from './dto/create-qa-bug.dto';
import { User as UserEntity } from '@prisma/client';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: CreateProjectDto, user: UserEntity): Promise<{
        _count: {
            comments: number;
            tasks: number;
        };
        owner: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
        projectCoordinator: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
        pcTeamLead: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
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
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
    findAll(user: UserEntity): Promise<({
        _count: {
            comments: number;
            tasks: number;
        };
        owner: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
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
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    })[]>;
    findOne(id: string, user: UserEntity): Promise<{
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
                    name: string;
                    email: string;
                    id: string;
                    role: import(".prisma/client").$Enums.Role;
                };
                requestedBy: {
                    name: string;
                    email: string;
                    id: string;
                    role: import(".prisma/client").$Enums.Role;
                };
            } & {
                description: string;
                id: string;
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
                name: string;
                email: string;
                id: string;
                role: import(".prisma/client").$Enums.Role;
            };
            permissionGrantedBy: {
                name: string;
                email: string;
                id: string;
                role: import(".prisma/client").$Enums.Role;
            };
            qaRounds: ({
                bugs: ({
                    assignedTo: {
                        name: string;
                        email: string;
                        id: string;
                        role: import(".prisma/client").$Enums.Role;
                    };
                } & {
                    description: string;
                    title: string;
                    id: string;
                    status: import(".prisma/client").$Enums.BugStatus;
                    assignedToId: string | null;
                    qaRoundId: string;
                    severity: import(".prisma/client").$Enums.BugSeverity;
                    foundAt: Date;
                    fixedAt: Date | null;
                    screenshot: string | null;
                    steps: string | null;
                })[];
                testedBy: {
                    name: string;
                    email: string;
                    id: string;
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
                    name: string;
                    email: string;
                    id: string;
                    role: import(".prisma/client").$Enums.Role;
                };
                reviewedBy: {
                    name: string;
                    email: string;
                    id: string;
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
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
        tasks: ({
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
        })[];
    } & {
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
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
    update(id: string, updateProjectDto: UpdateProjectDto, user: UserEntity): Promise<{
        _count: {
            comments: number;
            tasks: number;
        };
        owner: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
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
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
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
        _count: {
            comments: number;
            tasks: number;
        };
        departmentHistory: ({
            movedBy: {
                name: string;
                email: string;
                id: string;
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
            name: string;
            email: string;
            id: string;
            department: import(".prisma/client").$Enums.Department;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
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
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
    getDepartmentHistory(id: string, user: UserEntity): Promise<({
        movedBy: {
            name: string;
            email: string;
            id: string;
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
                name: string;
                email: string;
                id: string;
                role: import(".prisma/client").$Enums.Role;
            };
            requestedBy: {
                name: string;
                email: string;
                id: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            description: string;
            id: string;
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
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
        permissionGrantedBy: {
            name: string;
            email: string;
            id: string;
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
    createCorrection(projectId: string, historyId: string, correctionDto: CreateCorrectionDto, user: UserEntity): Promise<{
        assignedTo: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
        requestedBy: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        description: string;
        id: string;
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
    }>;
    getProjectCorrections(id: string, user: UserEntity): Promise<({
        departmentHistory: {
            createdAt: Date;
            fromDepartment: import(".prisma/client").$Enums.Department;
            toDepartment: import(".prisma/client").$Enums.Department;
        };
        assignedTo: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
        requestedBy: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        description: string;
        id: string;
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
    })[]>;
    updateCorrection(projectId: string, correctionId: string, updateDto: UpdateCorrectionDto, user: UserEntity): Promise<{
        assignedTo: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
        requestedBy: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        description: string;
        id: string;
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
    }>;
    getTimelineAnalytics(id: string, user: UserEntity): Promise<{
        projectId: string;
        totalDuration: number;
        departmentBreakdown: {
            department: import(".prisma/client").$Enums.Department;
            estimatedDays: number;
            actualDays: number;
            workStartDate: string;
            workEndDate: string;
            correctionCount: number;
            status: import(".prisma/client").$Enums.DepartmentWorkStatus;
            efficiency: number;
        }[];
        totalCorrections: number;
        averageResolutionTime: number;
        estimateAccuracy: number;
        bottlenecks: import(".prisma/client").$Enums.Department[];
    }>;
    requestApproval(projectId: string, historyId: string, approvalDto: CreateApprovalDto, user: UserEntity): Promise<{
        requestedBy: {
            name: string;
            email: string;
            id: string;
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
    }>;
    submitApproval(projectId: string, approvalId: string, updateDto: UpdateApprovalDto, user: UserEntity): Promise<{
        requestedBy: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
        reviewedBy: {
            name: string;
            email: string;
            id: string;
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
    }>;
    startQATesting(projectId: string, historyId: string, qaDto: CreateQATestingRoundDto, user: UserEntity): Promise<{
        testedBy: {
            name: string;
            email: string;
            id: string;
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
    }>;
    completeQATesting(projectId: string, qaRoundId: string, completeDto: any, user: UserEntity): Promise<{
        bugs: {
            description: string;
            title: string;
            id: string;
            status: import(".prisma/client").$Enums.BugStatus;
            assignedToId: string | null;
            qaRoundId: string;
            severity: import(".prisma/client").$Enums.BugSeverity;
            foundAt: Date;
            fixedAt: Date | null;
            screenshot: string | null;
            steps: string | null;
        }[];
        testedBy: {
            name: string;
            email: string;
            id: string;
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
    }>;
    createQABug(projectId: string, qaRoundId: string, bugDto: CreateQABugDto, user: UserEntity): Promise<{
        assignedTo: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        description: string;
        title: string;
        id: string;
        status: import(".prisma/client").$Enums.BugStatus;
        assignedToId: string | null;
        qaRoundId: string;
        severity: import(".prisma/client").$Enums.BugSeverity;
        foundAt: Date;
        fixedAt: Date | null;
        screenshot: string | null;
        steps: string | null;
    }>;
    getWorkflowStatus(id: string, user: UserEntity): Promise<{
        departmentHistory: ({
            corrections: ({
                assignedTo: {
                    name: string;
                    email: string;
                    id: string;
                    role: import(".prisma/client").$Enums.Role;
                };
                requestedBy: {
                    name: string;
                    email: string;
                    id: string;
                    role: import(".prisma/client").$Enums.Role;
                };
            } & {
                description: string;
                id: string;
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
            qaRounds: ({
                bugs: ({
                    assignedTo: {
                        name: string;
                        email: string;
                        id: string;
                        role: import(".prisma/client").$Enums.Role;
                    };
                } & {
                    description: string;
                    title: string;
                    id: string;
                    status: import(".prisma/client").$Enums.BugStatus;
                    assignedToId: string | null;
                    qaRoundId: string;
                    severity: import(".prisma/client").$Enums.BugSeverity;
                    foundAt: Date;
                    fixedAt: Date | null;
                    screenshot: string | null;
                    steps: string | null;
                })[];
                testedBy: {
                    name: string;
                    email: string;
                    id: string;
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
                    name: string;
                    email: string;
                    id: string;
                    role: import(".prisma/client").$Enums.Role;
                };
                reviewedBy: {
                    name: string;
                    email: string;
                    id: string;
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
    } & {
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
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
    getAllowedNextDepartments(id: string, user: UserEntity): Promise<import(".prisma/client").$Enums.Department[]>;
    getWorkflowValidationStatus(id: string, user: UserEntity): Promise<{
        currentDepartment: import(".prisma/client").$Enums.Department;
        currentStatus: import(".prisma/client").$Enums.DepartmentWorkStatus;
        allowedNextDepartments: import(".prisma/client").$Enums.Department[];
        workflowSequence: import(".prisma/client").$Enums.Department[];
        approvalGate: {
            required: boolean;
            satisfied: boolean;
            missingRequirements: string[];
        };
        canProceed: boolean;
    }>;
    requestManagerReview(projectId: string, reviewData: {
        reason: string;
    }, user: UserEntity): Promise<{
        requestedBy: {
            name: string;
            email: string;
            id: string;
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
    }>;
    submitManagerReview(approvalId: string, reviewDecision: {
        decision: 'PROCEED' | 'REVISE' | 'CANCEL';
        comments: string;
    }, user: UserEntity): Promise<{
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
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
    reassignPCOrTL(projectId: string, reassignDto: {
        assignmentType: 'PROJECT_COORDINATOR' | 'PC_TEAM_LEAD';
        newUserId: string;
        reason?: string;
        notes?: string;
    }, user: UserEntity): Promise<{
        owner: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
        projectCoordinator: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
        pcTeamLead: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
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
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
    getAssignmentHistory(projectId: string, user: UserEntity): Promise<({
        previousUser: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
        assignedBy: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        projectId: string;
        notes: string | null;
        assignmentType: import(".prisma/client").$Enums.ProjectAssignmentType;
        newUserId: string | null;
        assignedAt: Date;
        reason: string | null;
        previousUserId: string | null;
        assignedById: string;
    })[]>;
}
