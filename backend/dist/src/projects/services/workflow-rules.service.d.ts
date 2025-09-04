import { Department, DepartmentWorkStatus, ApprovalStatus, QAStatus } from '@prisma/client';
export interface WorkflowTransition {
    from: Department;
    to: Department;
    requiredStatus?: DepartmentWorkStatus;
    requiresApproval?: boolean;
    requiresQAPassing?: boolean;
    allowedRoles?: string[];
}
export interface WorkflowGate {
    department: Department;
    requiredApprovals?: string[];
    requiredQAStatus?: QAStatus;
    minimumWorkStatus?: DepartmentWorkStatus;
    requiresChecklistCompletion?: boolean;
}
export declare class WorkflowRulesService {
    private readonly workflowSequence;
    private readonly validTransitions;
    private readonly approvalGates;
    isValidTransition(from: Department, to: Department): boolean;
    getTransitionRequirements(from: Department, to: Department): WorkflowTransition | null;
    getApprovalGate(department: Department): WorkflowGate | null;
    areApprovalGatesSatisfied(department: Department, currentStatus: DepartmentWorkStatus, approvals: Array<{
        approvalType: string;
        status: ApprovalStatus;
    }>, qaRounds: Array<{
        status: QAStatus;
    }>, checklistCompleted?: boolean): {
        satisfied: boolean;
        missingRequirements: string[];
    };
    getAllowedNextDepartments(currentDepartment: Department): Department[];
    getWorkflowSequence(projectCategory: string): Department[];
    canSkipDepartment(department: Department, reason: string, userRole: string): boolean;
    getBugFixDepartment(bugDescription: string, bugTitle: string): Department[];
    requiresManagerReview(projectRejectionCount: number, criticalBugsCount: number): boolean;
    validateWorkflowTransition(currentDepartment: Department, targetDepartment: Department, currentStatus: DepartmentWorkStatus, approvals: Array<{
        approvalType: string;
        status: ApprovalStatus;
    }>, qaRounds: Array<{
        status: QAStatus;
    }>, userRole: string, checklistCompleted?: boolean): {
        valid: boolean;
        errors: string[];
    };
}
