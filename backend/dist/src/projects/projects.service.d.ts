import { PrismaService } from '../database/prisma.service';
import { WorkflowRulesService } from './services/workflow-rules.service';
import { WorkflowValidatorService } from './services/workflow-validator.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateDepartmentTransitionDto } from './dto/create-department-transition.dto';
import { UpdateDepartmentWorkStatusDto } from './dto/update-department-work-status.dto';
import { CreateCorrectionDto } from './dto/create-correction.dto';
import { UpdateCorrectionDto } from './dto/update-correction.dto';
import { User, Role, ApprovalType, ApprovalStatus, QAType, QAStatus } from '@prisma/client';
export declare class ProjectsService {
    private prisma;
    private workflowRules;
    private workflowValidator;
    constructor(prisma: PrismaService, workflowRules: WorkflowRulesService, workflowValidator: WorkflowValidatorService);
    create(createProjectDto: CreateProjectDto, user: User): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        ownerId: string;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
    findAll(userId?: string, role?: Role, user?: User): Promise<({
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
        createdAt: Date;
        updatedAt: Date;
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        ownerId: string;
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
        createdAt: Date;
        updatedAt: Date;
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        ownerId: string;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
    update(id: string, updateProjectDto: UpdateProjectDto, user: User): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        ownerId: string;
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
        createdAt: Date;
        updatedAt: Date;
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        ownerId: string;
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
    createCorrection(projectId: string, historyId: string, correctionDto: CreateCorrectionDto, user: User): Promise<{
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
    }>;
    getProjectCorrections(projectId: string, user: User): Promise<({
        departmentHistory: {
            createdAt: Date;
            fromDepartment: import(".prisma/client").$Enums.Department;
            toDepartment: import(".prisma/client").$Enums.Department;
        };
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
    })[]>;
    updateCorrection(projectId: string, correctionId: string, updateDto: UpdateCorrectionDto, user: User): Promise<{
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
    }>;
    getTimelineAnalytics(projectId: string, user: User): Promise<{
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
    requestApproval(projectId: string, historyId: string, approvalType: ApprovalType, user: User): Promise<{
        requestedBy: {
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
    }>;
    submitApproval(approvalId: string, status: ApprovalStatus, comments?: string, rejectionReason?: string, user?: User): Promise<{
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
    }>;
    startQATesting(projectId: string, historyId: string, qaType: QAType, testedById: string, user: User): Promise<{
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
    }>;
    completeQATestingRound(qaRoundId: string, status: QAStatus, bugsFound: number, criticalBugs: number, testResults?: string, rejectionReason?: string): Promise<{
        bugs: {
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
        }[];
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
    }>;
    createQABug(qaRoundId: string, bugData: any, user: User): Promise<{
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
    }>;
    getWorkflowStatus(projectId: string): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        ownerId: string;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
    getAllowedNextDepartments(projectId: string, user: User): Promise<import(".prisma/client").$Enums.Department[]>;
    getWorkflowValidationStatus(projectId: string, user: User): Promise<{
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
    requestManagerReview(projectId: string, reason: string, user: User): Promise<{
        requestedBy: {
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
    }>;
    submitManagerReview(approvalId: string, decision: 'PROCEED' | 'REVISE' | 'CANCEL', comments: string, user: User): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        ownerId: string;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
    reassignPCOrTL(projectId: string, reassignDto: {
        assignmentType: 'PROJECT_COORDINATOR' | 'PC_TEAM_LEAD';
        newUserId: string;
        reason?: string;
        notes?: string;
    }, user: User): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        currentDepartment: import(".prisma/client").$Enums.Department;
        nextDepartment: import(".prisma/client").$Enums.Department | null;
        projectCode: string;
        ownerId: string;
        projectCoordinatorId: string | null;
        pcTeamLeadId: string | null;
    }>;
    getAssignmentHistory(projectId: string, user: User): Promise<({
        previousUser: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        assignedBy: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        projectId: string;
        notes: string | null;
        assignmentType: import(".prisma/client").$Enums.ProjectAssignmentType;
        previousUserId: string | null;
        newUserId: string | null;
        assignedById: string;
        assignedAt: Date;
        reason: string | null;
    })[]>;
}
