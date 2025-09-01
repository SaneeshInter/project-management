import { PrismaService } from '../../database/prisma.service';
import { WorkflowRulesService } from './workflow-rules.service';
import { Department, DepartmentWorkStatus, User } from '@prisma/client';
export declare class WorkflowValidatorService {
    private prisma;
    private workflowRules;
    constructor(prisma: PrismaService, workflowRules: WorkflowRulesService);
    validateDepartmentTransition(projectId: string, targetDepartment: Department, user: User): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    validateStatusUpdate(projectId: string, newStatus: DepartmentWorkStatus, user: User): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private getRolePermissions;
    validateWorkflowPermission(projectId: string, action: 'move_department' | 'update_status' | 'approve' | 'start_qa', user: User): Promise<{
        valid: boolean;
        errors: string[];
    }>;
}
