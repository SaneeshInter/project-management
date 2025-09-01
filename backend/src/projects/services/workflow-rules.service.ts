import { Injectable } from '@nestjs/common';
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
}

@Injectable()
export class WorkflowRulesService {
  // Define the strict workflow sequence
  private readonly workflowSequence: Department[] = [
    Department.PMO,
    Department.DESIGN,
    Department.HTML,
    Department.PHP,    // or REACT depending on project category
    Department.REACT,  // or PHP depending on project category
    Department.QA,
    Department.DELIVERY,
  ];

  // Define valid department transitions with requirements
  private readonly validTransitions: WorkflowTransition[] = [
    // PMO can move to DESIGN without restrictions
    {
      from: Department.PMO,
      to: Department.DESIGN,
      requiredStatus: DepartmentWorkStatus.COMPLETED,
    },
    
    // DESIGN requires client approval before moving to HTML
    {
      from: Department.DESIGN,
      to: Department.HTML,
      requiredStatus: DepartmentWorkStatus.COMPLETED,
      requiresApproval: true,
    },
    
    // HTML requires QA testing pass before moving to development
    {
      from: Department.HTML,
      to: Department.PHP,
      requiredStatus: DepartmentWorkStatus.COMPLETED,
      requiresQAPassing: true,
    },
    
    {
      from: Department.HTML,
      to: Department.REACT,
      requiredStatus: DepartmentWorkStatus.COMPLETED,
      requiresQAPassing: true,
    },
    
    // Development (PHP/REACT) requires DEV QA rounds before final QA
    {
      from: Department.PHP,
      to: Department.QA,
      requiredStatus: DepartmentWorkStatus.COMPLETED,
      requiresQAPassing: true,
    },
    
    {
      from: Department.REACT,
      to: Department.QA,
      requiredStatus: DepartmentWorkStatus.COMPLETED,
      requiresQAPassing: true,
    },
    
    // Final QA requires before-live QA approval before delivery
    {
      from: Department.QA,
      to: Department.DELIVERY,
      requiredStatus: DepartmentWorkStatus.READY_FOR_DELIVERY,
      requiresApproval: true,
    },
  ];

  // Define approval gates for each critical department
  private readonly approvalGates: WorkflowGate[] = [
    {
      department: Department.DESIGN,
      requiredApprovals: ['CLIENT_APPROVAL'],
      minimumWorkStatus: DepartmentWorkStatus.COMPLETED,
    },
    {
      department: Department.HTML,
      requiredQAStatus: QAStatus.PASSED,
      minimumWorkStatus: DepartmentWorkStatus.COMPLETED,
    },
    {
      department: Department.PHP,
      requiredQAStatus: QAStatus.PASSED,
      minimumWorkStatus: DepartmentWorkStatus.COMPLETED,
    },
    {
      department: Department.REACT,
      requiredQAStatus: QAStatus.PASSED,
      minimumWorkStatus: DepartmentWorkStatus.COMPLETED,
    },
    {
      department: Department.QA,
      requiredApprovals: ['BEFORE_LIVE_QA'],
      minimumWorkStatus: DepartmentWorkStatus.BEFORE_LIVE_QA,
    },
  ];

  /**
   * Check if a department transition is valid
   */
  isValidTransition(from: Department, to: Department): boolean {
    return this.validTransitions.some(
      transition => transition.from === from && transition.to === to
    );
  }

  /**
   * Get the required conditions for a department transition
   */
  getTransitionRequirements(from: Department, to: Department): WorkflowTransition | null {
    return this.validTransitions.find(
      transition => transition.from === from && transition.to === to
    ) || null;
  }

  /**
   * Get approval gate requirements for a department
   */
  getApprovalGate(department: Department): WorkflowGate | null {
    return this.approvalGates.find(gate => gate.department === department) || null;
  }

  /**
   * Check if all approval gates are satisfied for a department
   */
  areApprovalGatesSatisfied(
    department: Department,
    currentStatus: DepartmentWorkStatus,
    approvals: Array<{ approvalType: string; status: ApprovalStatus }>,
    qaRounds: Array<{ status: QAStatus }>
  ): { satisfied: boolean; missingRequirements: string[] } {
    const gate = this.getApprovalGate(department);
    if (!gate) {
      return { satisfied: true, missingRequirements: [] };
    }

    const missingRequirements: string[] = [];

    // Check minimum work status
    if (gate.minimumWorkStatus && currentStatus !== gate.minimumWorkStatus) {
      missingRequirements.push(`Work status must be ${gate.minimumWorkStatus}`);
    }

    // Check required approvals
    if (gate.requiredApprovals) {
      for (const requiredApproval of gate.requiredApprovals) {
        const approval = approvals.find(a => a.approvalType === requiredApproval);
        if (!approval || approval.status !== ApprovalStatus.APPROVED) {
          missingRequirements.push(`Missing ${requiredApproval} approval`);
        }
      }
    }

    // Check required QA status
    if (gate.requiredQAStatus) {
      const hasPassingQA = qaRounds.some(qa => qa.status === gate.requiredQAStatus);
      if (!hasPassingQA) {
        missingRequirements.push(`QA testing must pass (status: ${gate.requiredQAStatus})`);
      }
    }

    return {
      satisfied: missingRequirements.length === 0,
      missingRequirements,
    };
  }

  /**
   * Get the next allowed departments from current department
   */
  getAllowedNextDepartments(currentDepartment: Department): Department[] {
    return this.validTransitions
      .filter(transition => transition.from === currentDepartment)
      .map(transition => transition.to);
  }

  /**
   * Get the proper workflow sequence for a project category
   */
  getWorkflowSequence(projectCategory: string): Department[] {
    const baseSequence: Department[] = [Department.PMO, Department.DESIGN, Department.HTML];
    
    // Add development phase based on project category
    if (projectCategory.includes('PHP')) {
      baseSequence.push(Department.PHP);
    } else if (projectCategory.includes('REACT') || projectCategory.includes('NEXT')) {
      baseSequence.push(Department.REACT);
    } else if (projectCategory.includes('WORDPRESS')) {
      baseSequence.push(Department.WORDPRESS);
    } else {
      // Default to REACT for other categories
      baseSequence.push(Department.REACT);
    }
    
    // Add final stages
    baseSequence.push(Department.QA);
    baseSequence.push(Department.DELIVERY);
    
    return baseSequence;
  }

  /**
   * Check if a department can be skipped (emergency scenarios)
   */
  canSkipDepartment(department: Department, reason: string, userRole: string): boolean {
    // Only admins can skip departments and only in emergency
    if (userRole !== 'ADMIN') return false;
    
    // Never allow skipping critical approval gates
    const criticalDepartments: Department[] = [Department.DESIGN, Department.QA];
    if (criticalDepartments.includes(department)) {
      return false;
    }
    
    return reason.toLowerCase().includes('emergency');
  }

  /**
   * Validate if project can move to target department
   */
  validateWorkflowTransition(
    currentDepartment: Department,
    targetDepartment: Department,
    currentStatus: DepartmentWorkStatus,
    approvals: Array<{ approvalType: string; status: ApprovalStatus }>,
    qaRounds: Array<{ status: QAStatus }>,
    userRole: string
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if transition is valid
    if (!this.isValidTransition(currentDepartment, targetDepartment)) {
      errors.push(`Invalid transition from ${currentDepartment} to ${targetDepartment}`);
      return { valid: false, errors };
    }

    // Get transition requirements
    const requirements = this.getTransitionRequirements(currentDepartment, targetDepartment);
    if (!requirements) {
      errors.push('Transition requirements not found');
      return { valid: false, errors };
    }

    // Check work status requirement
    if (requirements.requiredStatus && currentStatus !== requirements.requiredStatus) {
      errors.push(`Current department must be ${requirements.requiredStatus} before moving`);
    }

    // Check approval requirements
    if (requirements.requiresApproval) {
      const gateCheck = this.areApprovalGatesSatisfied(currentDepartment, currentStatus, approvals, qaRounds);
      if (!gateCheck.satisfied) {
        errors.push(...gateCheck.missingRequirements);
      }
    }

    // Check QA requirements
    if (requirements.requiresQAPassing) {
      const hasPassingQA = qaRounds.some(qa => qa.status === QAStatus.PASSED);
      if (!hasPassingQA) {
        errors.push('QA testing must pass before proceeding');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}