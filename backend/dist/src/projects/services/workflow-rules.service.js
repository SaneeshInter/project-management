"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowRulesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let WorkflowRulesService = class WorkflowRulesService {
    constructor() {
        this.workflowSequence = [
            client_1.Department.PMO,
            client_1.Department.DESIGN,
            client_1.Department.HTML,
            client_1.Department.PHP,
            client_1.Department.REACT,
            client_1.Department.QA,
            client_1.Department.DELIVERY,
        ];
        this.validTransitions = [
            {
                from: client_1.Department.PMO,
                to: client_1.Department.DESIGN,
                requiredStatus: client_1.DepartmentWorkStatus.COMPLETED,
                requiresApproval: true,
                allowedRoles: ['PROJECT_COORDINATOR', 'ADMIN'],
            },
            {
                from: client_1.Department.DESIGN,
                to: client_1.Department.HTML,
                requiredStatus: client_1.DepartmentWorkStatus.COMPLETED,
                requiresApproval: true,
                allowedRoles: ['PROJECT_COORDINATOR', 'ADMIN'],
            },
            {
                from: client_1.Department.HTML,
                to: client_1.Department.PHP,
                requiredStatus: client_1.DepartmentWorkStatus.COMPLETED,
                requiresQAPassing: true,
                allowedRoles: ['PROJECT_COORDINATOR', 'QA_TESTER', 'ADMIN'],
            },
            {
                from: client_1.Department.HTML,
                to: client_1.Department.REACT,
                requiredStatus: client_1.DepartmentWorkStatus.COMPLETED,
                requiresQAPassing: true,
                allowedRoles: ['PROJECT_COORDINATOR', 'QA_TESTER', 'ADMIN'],
            },
            {
                from: client_1.Department.PHP,
                to: client_1.Department.QA,
                requiredStatus: client_1.DepartmentWorkStatus.COMPLETED,
                allowedRoles: ['DEVELOPER', 'PROJECT_COORDINATOR', 'ADMIN'],
            },
            {
                from: client_1.Department.REACT,
                to: client_1.Department.QA,
                requiredStatus: client_1.DepartmentWorkStatus.COMPLETED,
                allowedRoles: ['DEVELOPER', 'PROJECT_COORDINATOR', 'ADMIN'],
            },
            {
                from: client_1.Department.QA,
                to: client_1.Department.DELIVERY,
                requiredStatus: client_1.DepartmentWorkStatus.READY_FOR_DELIVERY,
                requiresApproval: true,
                allowedRoles: ['QA_TESTER', 'PROJECT_COORDINATOR', 'ADMIN'],
            },
            {
                from: client_1.Department.HTML,
                to: client_1.Department.DESIGN,
                requiredStatus: client_1.DepartmentWorkStatus.CORRECTIONS_NEEDED,
                allowedRoles: ['PROJECT_COORDINATOR', 'QA_TESTER', 'ADMIN'],
            },
            {
                from: client_1.Department.QA,
                to: client_1.Department.HTML,
                requiredStatus: client_1.DepartmentWorkStatus.BUGFIX_IN_PROGRESS,
                allowedRoles: ['QA_TESTER', 'PROJECT_COORDINATOR', 'ADMIN'],
            },
            {
                from: client_1.Department.QA,
                to: client_1.Department.PHP,
                requiredStatus: client_1.DepartmentWorkStatus.BUGFIX_IN_PROGRESS,
                allowedRoles: ['QA_TESTER', 'PROJECT_COORDINATOR', 'ADMIN'],
            },
            {
                from: client_1.Department.QA,
                to: client_1.Department.REACT,
                requiredStatus: client_1.DepartmentWorkStatus.BUGFIX_IN_PROGRESS,
                allowedRoles: ['QA_TESTER', 'PROJECT_COORDINATOR', 'ADMIN'],
            },
        ];
        this.approvalGates = [
            {
                department: client_1.Department.PMO,
                requiredApprovals: ['CLIENT_APPROVAL'],
                minimumWorkStatus: client_1.DepartmentWorkStatus.PENDING_CLIENT_APPROVAL,
                requiresChecklistCompletion: true,
            },
            {
                department: client_1.Department.DESIGN,
                requiredApprovals: ['CLIENT_APPROVAL'],
                minimumWorkStatus: client_1.DepartmentWorkStatus.PENDING_CLIENT_APPROVAL,
                requiresChecklistCompletion: true,
            },
            {
                department: client_1.Department.HTML,
                requiredQAStatus: client_1.QAStatus.PASSED,
                minimumWorkStatus: client_1.DepartmentWorkStatus.QA_TESTING,
                requiresChecklistCompletion: true,
            },
            {
                department: client_1.Department.PHP,
                requiredQAStatus: client_1.QAStatus.PASSED,
                minimumWorkStatus: client_1.DepartmentWorkStatus.QA_TESTING,
                requiresChecklistCompletion: true,
            },
            {
                department: client_1.Department.REACT,
                requiredQAStatus: client_1.QAStatus.PASSED,
                minimumWorkStatus: client_1.DepartmentWorkStatus.QA_TESTING,
                requiresChecklistCompletion: true,
            },
            {
                department: client_1.Department.QA,
                minimumWorkStatus: client_1.DepartmentWorkStatus.READY_FOR_DELIVERY,
                requiresChecklistCompletion: true,
            },
        ];
    }
    isValidTransition(from, to) {
        return this.validTransitions.some(transition => transition.from === from && transition.to === to);
    }
    getTransitionRequirements(from, to) {
        return this.validTransitions.find(transition => transition.from === from && transition.to === to) || null;
    }
    getApprovalGate(department) {
        return this.approvalGates.find(gate => gate.department === department) || null;
    }
    areApprovalGatesSatisfied(department, currentStatus, approvals, qaRounds, checklistCompleted) {
        const gate = this.getApprovalGate(department);
        if (!gate) {
            return { satisfied: true, missingRequirements: [] };
        }
        const missingRequirements = [];
        if (gate.minimumWorkStatus && currentStatus !== gate.minimumWorkStatus) {
            missingRequirements.push(`Work status must be ${gate.minimumWorkStatus}`);
        }
        if (gate.requiredApprovals) {
            for (const requiredApproval of gate.requiredApprovals) {
                const approval = approvals.find(a => a.approvalType === requiredApproval);
                if (!approval || approval.status !== client_1.ApprovalStatus.APPROVED) {
                    missingRequirements.push(`Missing ${requiredApproval} approval`);
                }
            }
        }
        if (gate.requiredQAStatus) {
            const hasPassingQA = qaRounds.some(qa => qa.status === gate.requiredQAStatus);
            if (!hasPassingQA) {
                missingRequirements.push(`QA testing must pass (status: ${gate.requiredQAStatus})`);
            }
        }
        if (gate.requiresChecklistCompletion && checklistCompleted === false) {
            missingRequirements.push(`Department checklist must be completed before proceeding`);
        }
        return {
            satisfied: missingRequirements.length === 0,
            missingRequirements,
        };
    }
    getAllowedNextDepartments(currentDepartment) {
        return this.validTransitions
            .filter(transition => transition.from === currentDepartment)
            .map(transition => transition.to);
    }
    getWorkflowSequence(projectCategory) {
        const baseSequence = [client_1.Department.PMO, client_1.Department.DESIGN, client_1.Department.HTML];
        if (projectCategory.includes('PHP')) {
            baseSequence.push(client_1.Department.PHP);
        }
        else if (projectCategory.includes('REACT') || projectCategory.includes('NEXT')) {
            baseSequence.push(client_1.Department.REACT);
        }
        else if (projectCategory.includes('WORDPRESS')) {
            baseSequence.push(client_1.Department.WORDPRESS);
        }
        else {
            baseSequence.push(client_1.Department.REACT);
        }
        baseSequence.push(client_1.Department.QA);
        baseSequence.push(client_1.Department.DELIVERY);
        return baseSequence;
    }
    canSkipDepartment(department, reason, userRole) {
        if (userRole !== 'ADMIN')
            return false;
        const criticalDepartments = [client_1.Department.DESIGN, client_1.Department.QA];
        if (criticalDepartments.includes(department)) {
            return false;
        }
        return reason.toLowerCase().includes('emergency');
    }
    getBugFixDepartment(bugDescription, bugTitle) {
        const content = (bugDescription + ' ' + bugTitle).toLowerCase();
        const possibleDepartments = [];
        const htmlKeywords = ['layout', 'css', 'styling', 'responsive', 'alignment', 'ui', 'visual', 'design', 'html', 'frontend'];
        const devKeywords = ['function', 'api', 'database', 'backend', 'logic', 'validation', 'calculation', 'data', 'server'];
        const hasHtmlKeywords = htmlKeywords.some(keyword => content.includes(keyword));
        const hasDevKeywords = devKeywords.some(keyword => content.includes(keyword));
        if (hasHtmlKeywords)
            possibleDepartments.push(client_1.Department.HTML);
        if (hasDevKeywords) {
            possibleDepartments.push(client_1.Department.PHP);
            possibleDepartments.push(client_1.Department.REACT);
        }
        if (possibleDepartments.length === 0) {
            possibleDepartments.push(client_1.Department.HTML, client_1.Department.PHP, client_1.Department.REACT);
        }
        return possibleDepartments;
    }
    requiresManagerReview(projectRejectionCount, criticalBugsCount) {
        return projectRejectionCount > 0 || criticalBugsCount > 2;
    }
    validateWorkflowTransition(currentDepartment, targetDepartment, currentStatus, approvals, qaRounds, userRole, checklistCompleted) {
        const errors = [];
        if (!this.isValidTransition(currentDepartment, targetDepartment)) {
            errors.push(`Invalid transition from ${currentDepartment} to ${targetDepartment}`);
            return { valid: false, errors };
        }
        const requirements = this.getTransitionRequirements(currentDepartment, targetDepartment);
        if (!requirements) {
            errors.push('Transition requirements not found');
            return { valid: false, errors };
        }
        if (requirements.requiredStatus && currentStatus !== requirements.requiredStatus) {
            errors.push(`Current department must be ${requirements.requiredStatus} before moving`);
        }
        if (requirements.requiresApproval) {
            const gateCheck = this.areApprovalGatesSatisfied(currentDepartment, currentStatus, approvals, qaRounds, checklistCompleted);
            if (!gateCheck.satisfied) {
                errors.push(...gateCheck.missingRequirements);
            }
        }
        if (requirements.requiresQAPassing) {
            const hasPassingQA = qaRounds.some(qa => qa.status === client_1.QAStatus.PASSED);
            if (!hasPassingQA) {
                errors.push('QA testing must pass before proceeding');
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
};
exports.WorkflowRulesService = WorkflowRulesService;
exports.WorkflowRulesService = WorkflowRulesService = __decorate([
    (0, common_1.Injectable)()
], WorkflowRulesService);
//# sourceMappingURL=workflow-rules.service.js.map