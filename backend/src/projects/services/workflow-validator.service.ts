import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowRulesService } from './workflow-rules.service';
import { Department, DepartmentWorkStatus, User, Role } from '@prisma/client';

@Injectable()
export class WorkflowValidatorService {
  constructor(
    private prisma: PrismaService,
    private workflowRules: WorkflowRulesService
  ) {}

  /**
   * Validate if a project can be moved to a target department
   */
  async validateDepartmentTransition(
    projectId: string,
    targetDepartment: Department,
    user: User
  ): Promise<{ valid: boolean; errors: string[] }> {
    // Get project with current status and workflow data
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return { valid: false, errors: ['Project not found'] };
    }

    // Get current department history
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

    const currentStatus = currentHistory?.workStatus || DepartmentWorkStatus.NOT_STARTED;
    const approvals = currentHistory?.approvals || [];
    const qaRounds = currentHistory?.qaRounds || [];

    // Use workflow rules to validate transition
    return this.workflowRules.validateWorkflowTransition(
      project.currentDepartment,
      targetDepartment,
      currentStatus,
      approvals.map(a => ({ approvalType: a.approvalType, status: a.status })),
      qaRounds.map(qa => ({ status: qa.status })),
      user.role
    );
  }

  /**
   * Validate if work status can be updated
   */
  async validateStatusUpdate(
    projectId: string,
    newStatus: DepartmentWorkStatus,
    user: User
  ): Promise<{ valid: boolean; errors: string[] }> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return { valid: false, errors: ['Project not found'] };
    }

    // Get current department history
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

    const currentStatus = currentHistory?.workStatus || DepartmentWorkStatus.NOT_STARTED;
    const errors: string[] = [];

    // Define valid status transitions
    const validStatusTransitions: Record<DepartmentWorkStatus, DepartmentWorkStatus[]> = {
      [DepartmentWorkStatus.NOT_STARTED]: [
        DepartmentWorkStatus.IN_PROGRESS,
        DepartmentWorkStatus.ON_HOLD,
      ],
      [DepartmentWorkStatus.IN_PROGRESS]: [
        DepartmentWorkStatus.COMPLETED,
        DepartmentWorkStatus.ON_HOLD,
        DepartmentWorkStatus.CORRECTIONS_NEEDED,
        DepartmentWorkStatus.PENDING_CLIENT_APPROVAL,
        DepartmentWorkStatus.QA_TESTING,
      ],
      [DepartmentWorkStatus.CORRECTIONS_NEEDED]: [
        DepartmentWorkStatus.IN_PROGRESS,
        DepartmentWorkStatus.BUGFIX_IN_PROGRESS,
      ],
      [DepartmentWorkStatus.COMPLETED]: [
        DepartmentWorkStatus.PENDING_CLIENT_APPROVAL,
        DepartmentWorkStatus.QA_TESTING,
        DepartmentWorkStatus.BEFORE_LIVE_QA,
      ],
      [DepartmentWorkStatus.ON_HOLD]: [
        DepartmentWorkStatus.IN_PROGRESS,
      ],
      [DepartmentWorkStatus.PENDING_CLIENT_APPROVAL]: [
        DepartmentWorkStatus.COMPLETED, // After approval
        DepartmentWorkStatus.CLIENT_REJECTED,
      ],
      [DepartmentWorkStatus.CLIENT_REJECTED]: [
        DepartmentWorkStatus.IN_PROGRESS,
      ],
      [DepartmentWorkStatus.QA_TESTING]: [
        DepartmentWorkStatus.COMPLETED, // QA passed
        DepartmentWorkStatus.QA_REJECTED,
      ],
      [DepartmentWorkStatus.QA_REJECTED]: [
        DepartmentWorkStatus.BUGFIX_IN_PROGRESS,
      ],
      [DepartmentWorkStatus.BUGFIX_IN_PROGRESS]: [
        DepartmentWorkStatus.QA_TESTING, // Retest after fix
        DepartmentWorkStatus.IN_PROGRESS,
      ],
      [DepartmentWorkStatus.BEFORE_LIVE_QA]: [
        DepartmentWorkStatus.READY_FOR_DELIVERY,
        DepartmentWorkStatus.QA_REJECTED,
      ],
      [DepartmentWorkStatus.READY_FOR_DELIVERY]: [
        // Final status - no transitions allowed
      ],
    };

    // Check if status transition is valid
    const allowedStatuses = validStatusTransitions[currentStatus] || [];
    if (!allowedStatuses.includes(newStatus)) {
      errors.push(`Cannot change status from ${currentStatus} to ${newStatus}`);
    }

    // Role-based validation
    const rolePermissions = this.getRolePermissions(user.role, project.currentDepartment);
    if (!rolePermissions.canUpdateStatus) {
      errors.push(`Role ${user.role} cannot update work status in ${project.currentDepartment}`);
    }

    // Special validation for critical status changes
    if (newStatus === DepartmentWorkStatus.COMPLETED) {
      // Check if all required work is actually done
      if (currentStatus !== DepartmentWorkStatus.IN_PROGRESS) {
        errors.push('Work must be in progress before marking as completed');
      }
    }

    if (newStatus === DepartmentWorkStatus.PENDING_CLIENT_APPROVAL) {
      // Only design department can request client approval
      if (project.currentDepartment !== Department.DESIGN) {
        errors.push('Client approval can only be requested from DESIGN department');
      }
    }

    if (newStatus === DepartmentWorkStatus.QA_TESTING) {
      // Only HTML, PHP, REACT departments can request QA testing
      const devDepartments: Department[] = [Department.HTML, Department.PHP, Department.REACT];
      if (!devDepartments.includes(project.currentDepartment)) {
        errors.push('QA testing can only be requested from development departments');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get role permissions for department actions
   */
  private getRolePermissions(role: Role, department: Department): {
    canUpdateStatus: boolean;
    canMoveDepartment: boolean;
    canApprove: boolean;
  } {
    switch (role) {
      case Role.ADMIN:
        return { canUpdateStatus: true, canMoveDepartment: true, canApprove: true };
      
      case Role.PROJECT_MANAGER:
        return { canUpdateStatus: true, canMoveDepartment: true, canApprove: true };
      
      case Role.DEVELOPER:
        // Developers can only work in their own department
        const devDepartments: Department[] = [Department.PHP, Department.REACT, Department.WORDPRESS];
        return {
          canUpdateStatus: devDepartments.includes(department),
          canMoveDepartment: false,
          canApprove: false,
        };
      
      case Role.DESIGNER:
        return {
          canUpdateStatus: department === Department.DESIGN,
          canMoveDepartment: false,
          canApprove: false,
        };
      
      case Role.CLIENT:
        return {
          canUpdateStatus: false,
          canMoveDepartment: false,
          canApprove: department === Department.DESIGN, // Only design approval
        };
      
      default:
        return { canUpdateStatus: false, canMoveDepartment: false, canApprove: false };
    }
  }

  /**
   * Check if user has permission to perform workflow action
   */
  async validateWorkflowPermission(
    projectId: string,
    action: 'move_department' | 'update_status' | 'approve' | 'start_qa',
    user: User
  ): Promise<{ valid: boolean; errors: string[] }> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return { valid: false, errors: ['Project not found'] };
    }

    const permissions = this.getRolePermissions(user.role, project.currentDepartment);
    const errors: string[] = [];

    switch (action) {
      case 'move_department':
        if (!permissions.canMoveDepartment) {
          errors.push(`Role ${user.role} cannot move projects between departments`);
        }
        break;
      
      case 'update_status':
        if (!permissions.canUpdateStatus) {
          errors.push(`Role ${user.role} cannot update work status in ${project.currentDepartment}`);
        }
        break;
      
      case 'approve':
        if (!permissions.canApprove) {
          errors.push(`Role ${user.role} cannot approve work in ${project.currentDepartment}`);
        }
        break;
      
      case 'start_qa':
        if (user.role !== Role.ADMIN && user.role !== Role.PROJECT_MANAGER) {
          errors.push('Only admins and project managers can start QA testing');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}