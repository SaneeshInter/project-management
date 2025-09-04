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
  requiresChecklistCompletion?: boolean;
}

@Injectable()
export class WorkflowRulesService {
  // Define the strict workflow sequence (PC manages the flow)
  private readonly workflowSequence: Department[] = [
    Department.PMO,      // PC prepares sections for website
    Department.DESIGN,   // PC shares KT to Designer, Designer completes design
    Department.HTML,     // HTML team converts design to HTML
    Department.PHP,      // or REACT depending on project category (Development)
    Department.REACT,    // or PHP depending on project category (Development)
    Department.QA,       // QA testing for both HTML and DEV
    Department.DELIVERY, // Final delivery after all approvals
  ];

  // Define valid department transitions based on documented workflow
  private readonly validTransitions: WorkflowTransition[] = [
    // PC prepares sections, gets client approval, then moves to DESIGN
    {
      from: Department.PMO,
      to: Department.DESIGN,
      requiredStatus: DepartmentWorkStatus.COMPLETED,
      requiresApproval: true, // Client approval of sections
      allowedRoles: ['PROJECT_COORDINATOR', 'ADMIN'],
    },
    
    // PC shares KT to Designer, Design team completes and sends to PC
    // PC verifies design QA and sends for client approval
    {
      from: Department.DESIGN,
      to: Department.HTML,
      requiredStatus: DepartmentWorkStatus.COMPLETED,
      requiresApproval: true, // Client approval of design
      allowedRoles: ['PROJECT_COORDINATOR', 'ADMIN'],
    },
    
    // HTML sends to QA, QA reports bugs and moves back to HTML for corrections
    // After QA approval, HTML moves to DEV
    {
      from: Department.HTML,
      to: Department.PHP,
      requiredStatus: DepartmentWorkStatus.COMPLETED,
      requiresQAPassing: true, // HTML QA must pass
      allowedRoles: ['PROJECT_COORDINATOR', 'QA_TESTER', 'ADMIN'],
    },
    
    {
      from: Department.HTML,
      to: Department.REACT,
      requiredStatus: DepartmentWorkStatus.COMPLETED,
      requiresQAPassing: true, // HTML QA must pass
      allowedRoles: ['PROJECT_COORDINATOR', 'QA_TESTER', 'ADMIN'],
    },
    
    // After DEV complete, send to QA for DEV testing
    // QA separates HTML and DEV bugs, both teams fix in parallel
    {
      from: Department.PHP,
      to: Department.QA,
      requiredStatus: DepartmentWorkStatus.COMPLETED,
      allowedRoles: ['DEVELOPER', 'PROJECT_COORDINATOR', 'ADMIN'],
    },
    
    {
      from: Department.REACT,
      to: Department.QA,
      requiredStatus: DepartmentWorkStatus.COMPLETED,
      allowedRoles: ['DEVELOPER', 'PROJECT_COORDINATOR', 'ADMIN'],
    },
    
    // Final QA validates fixes, if no issues move to DELIVERY
    {
      from: Department.QA,
      to: Department.DELIVERY,
      requiredStatus: DepartmentWorkStatus.READY_FOR_DELIVERY,
      requiresApproval: true, // Manager review if project was rejected
      allowedRoles: ['QA_TESTER', 'PROJECT_COORDINATOR', 'ADMIN'],
    },
    
    // Allow corrections to flow back to previous departments
    {
      from: Department.HTML,
      to: Department.DESIGN,
      requiredStatus: DepartmentWorkStatus.CORRECTIONS_NEEDED,
      allowedRoles: ['PROJECT_COORDINATOR', 'QA_TESTER', 'ADMIN'],
    },
    
    {
      from: Department.QA,
      to: Department.HTML,
      requiredStatus: DepartmentWorkStatus.BUGFIX_IN_PROGRESS,
      allowedRoles: ['QA_TESTER', 'PROJECT_COORDINATOR', 'ADMIN'],
    },
    
    {
      from: Department.QA,
      to: Department.PHP,
      requiredStatus: DepartmentWorkStatus.BUGFIX_IN_PROGRESS,
      allowedRoles: ['QA_TESTER', 'PROJECT_COORDINATOR', 'ADMIN'],
    },
    
    {
      from: Department.QA,
      to: Department.REACT,
      requiredStatus: DepartmentWorkStatus.BUGFIX_IN_PROGRESS,
      allowedRoles: ['QA_TESTER', 'PROJECT_COORDINATOR', 'ADMIN'],
    },
  ];

  // Define approval gates matching documented workflow
  private readonly approvalGates: WorkflowGate[] = [
    {
      department: Department.PMO,
      requiredApprovals: ['CLIENT_APPROVAL'], // Client approval of sections
      minimumWorkStatus: DepartmentWorkStatus.PENDING_CLIENT_APPROVAL,
      requiresChecklistCompletion: true,
    },
    {
      department: Department.DESIGN,
      requiredApprovals: ['CLIENT_APPROVAL'], // Client approval of design
      minimumWorkStatus: DepartmentWorkStatus.PENDING_CLIENT_APPROVAL,
      requiresChecklistCompletion: true,
    },
    {
      department: Department.HTML,
      requiredQAStatus: QAStatus.PASSED, // QA testing of HTML
      minimumWorkStatus: DepartmentWorkStatus.QA_TESTING,
      requiresChecklistCompletion: true,
    },
    {
      department: Department.PHP,
      requiredQAStatus: QAStatus.PASSED, // DEV QA testing
      minimumWorkStatus: DepartmentWorkStatus.QA_TESTING,
      requiresChecklistCompletion: true,
    },
    {
      department: Department.REACT,
      requiredQAStatus: QAStatus.PASSED, // DEV QA testing
      minimumWorkStatus: DepartmentWorkStatus.QA_TESTING,
      requiresChecklistCompletion: true,
    },
    {
      department: Department.QA,
      minimumWorkStatus: DepartmentWorkStatus.READY_FOR_DELIVERY, // All fixes validated
      requiresChecklistCompletion: true,
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
    qaRounds: Array<{ status: QAStatus }>,
    checklistCompleted?: boolean
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

    // Check checklist completion requirement
    if (gate.requiresChecklistCompletion && checklistCompleted === false) {
      missingRequirements.push(`Department checklist must be completed before proceeding`);
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
   * Determine target department for bug fixes based on bug type
   * This implements the HTML/DEV bug separation logic
   */
  getBugFixDepartment(bugDescription: string, bugTitle: string): Department[] {
    const content = (bugDescription + ' ' + bugTitle).toLowerCase();
    const possibleDepartments: Department[] = [];
    
    // HTML-related keywords
    const htmlKeywords = ['layout', 'css', 'styling', 'responsive', 'alignment', 'ui', 'visual', 'design', 'html', 'frontend'];
    // DEV-related keywords  
    const devKeywords = ['function', 'api', 'database', 'backend', 'logic', 'validation', 'calculation', 'data', 'server'];
    
    const hasHtmlKeywords = htmlKeywords.some(keyword => content.includes(keyword));
    const hasDevKeywords = devKeywords.some(keyword => content.includes(keyword));
    
    if (hasHtmlKeywords) possibleDepartments.push(Department.HTML);
    if (hasDevKeywords) {
      possibleDepartments.push(Department.PHP);
      possibleDepartments.push(Department.REACT);
    }
    
    // If unclear, assign to both for manual review
    if (possibleDepartments.length === 0) {
      possibleDepartments.push(Department.HTML, Department.PHP, Department.REACT);
    }
    
    return possibleDepartments;
  }

  /**
   * Check if project requires manager review due to rejection
   */
  requiresManagerReview(projectRejectionCount: number, criticalBugsCount: number): boolean {
    return projectRejectionCount > 0 || criticalBugsCount > 2;
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
    userRole: string,
    checklistCompleted?: boolean
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
      const gateCheck = this.areApprovalGatesSatisfied(currentDepartment, currentStatus, approvals, qaRounds, checklistCompleted);
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