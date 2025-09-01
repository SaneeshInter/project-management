"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowValidatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const workflow_rules_service_1 = require("./workflow-rules.service");
const client_1 = require("@prisma/client");
let WorkflowValidatorService = class WorkflowValidatorService {
    constructor(prisma, workflowRules) {
        this.prisma = prisma;
        this.workflowRules = workflowRules;
    }
    async validateDepartmentTransition(projectId, targetDepartment, user) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            return { valid: false, errors: ['Project not found'] };
        }
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
        const currentStatus = currentHistory?.workStatus || client_1.DepartmentWorkStatus.NOT_STARTED;
        const approvals = currentHistory?.approvals || [];
        const qaRounds = currentHistory?.qaRounds || [];
        return this.workflowRules.validateWorkflowTransition(project.currentDepartment, targetDepartment, currentStatus, approvals.map(a => ({ approvalType: a.approvalType, status: a.status })), qaRounds.map(qa => ({ status: qa.status })), user.role);
    }
    async validateStatusUpdate(projectId, newStatus, user) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            return { valid: false, errors: ['Project not found'] };
        }
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
        const currentStatus = currentHistory?.workStatus || client_1.DepartmentWorkStatus.NOT_STARTED;
        const errors = [];
        const validStatusTransitions = {
            [client_1.DepartmentWorkStatus.NOT_STARTED]: [
                client_1.DepartmentWorkStatus.IN_PROGRESS,
                client_1.DepartmentWorkStatus.ON_HOLD,
            ],
            [client_1.DepartmentWorkStatus.IN_PROGRESS]: [
                client_1.DepartmentWorkStatus.COMPLETED,
                client_1.DepartmentWorkStatus.ON_HOLD,
                client_1.DepartmentWorkStatus.CORRECTIONS_NEEDED,
                client_1.DepartmentWorkStatus.PENDING_CLIENT_APPROVAL,
                client_1.DepartmentWorkStatus.QA_TESTING,
            ],
            [client_1.DepartmentWorkStatus.CORRECTIONS_NEEDED]: [
                client_1.DepartmentWorkStatus.IN_PROGRESS,
                client_1.DepartmentWorkStatus.BUGFIX_IN_PROGRESS,
            ],
            [client_1.DepartmentWorkStatus.COMPLETED]: [
                client_1.DepartmentWorkStatus.PENDING_CLIENT_APPROVAL,
                client_1.DepartmentWorkStatus.QA_TESTING,
                client_1.DepartmentWorkStatus.BEFORE_LIVE_QA,
            ],
            [client_1.DepartmentWorkStatus.ON_HOLD]: [
                client_1.DepartmentWorkStatus.IN_PROGRESS,
            ],
            [client_1.DepartmentWorkStatus.PENDING_CLIENT_APPROVAL]: [
                client_1.DepartmentWorkStatus.COMPLETED,
                client_1.DepartmentWorkStatus.CLIENT_REJECTED,
            ],
            [client_1.DepartmentWorkStatus.CLIENT_REJECTED]: [
                client_1.DepartmentWorkStatus.IN_PROGRESS,
            ],
            [client_1.DepartmentWorkStatus.QA_TESTING]: [
                client_1.DepartmentWorkStatus.COMPLETED,
                client_1.DepartmentWorkStatus.QA_REJECTED,
            ],
            [client_1.DepartmentWorkStatus.QA_REJECTED]: [
                client_1.DepartmentWorkStatus.BUGFIX_IN_PROGRESS,
            ],
            [client_1.DepartmentWorkStatus.BUGFIX_IN_PROGRESS]: [
                client_1.DepartmentWorkStatus.QA_TESTING,
                client_1.DepartmentWorkStatus.IN_PROGRESS,
            ],
            [client_1.DepartmentWorkStatus.BEFORE_LIVE_QA]: [
                client_1.DepartmentWorkStatus.READY_FOR_DELIVERY,
                client_1.DepartmentWorkStatus.QA_REJECTED,
            ],
            [client_1.DepartmentWorkStatus.READY_FOR_DELIVERY]: [],
        };
        const allowedStatuses = validStatusTransitions[currentStatus] || [];
        if (!allowedStatuses.includes(newStatus)) {
            errors.push(`Cannot change status from ${currentStatus} to ${newStatus}`);
        }
        const rolePermissions = this.getRolePermissions(user.role, project.currentDepartment);
        if (!rolePermissions.canUpdateStatus) {
            errors.push(`Role ${user.role} cannot update work status in ${project.currentDepartment}`);
        }
        if (newStatus === client_1.DepartmentWorkStatus.COMPLETED) {
            if (currentStatus !== client_1.DepartmentWorkStatus.IN_PROGRESS) {
                errors.push('Work must be in progress before marking as completed');
            }
        }
        if (newStatus === client_1.DepartmentWorkStatus.PENDING_CLIENT_APPROVAL) {
            if (project.currentDepartment !== client_1.Department.DESIGN) {
                errors.push('Client approval can only be requested from DESIGN department');
            }
        }
        if (newStatus === client_1.DepartmentWorkStatus.QA_TESTING) {
            const devDepartments = [client_1.Department.HTML, client_1.Department.PHP, client_1.Department.REACT];
            if (!devDepartments.includes(project.currentDepartment)) {
                errors.push('QA testing can only be requested from development departments');
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    getRolePermissions(role, department) {
        switch (role) {
            case client_1.Role.ADMIN:
                return { canUpdateStatus: true, canMoveDepartment: true, canApprove: true };
            case client_1.Role.PROJECT_MANAGER:
                return { canUpdateStatus: true, canMoveDepartment: true, canApprove: true };
            case client_1.Role.DEVELOPER:
                const devDepartments = [client_1.Department.PHP, client_1.Department.REACT, client_1.Department.WORDPRESS];
                return {
                    canUpdateStatus: devDepartments.includes(department),
                    canMoveDepartment: false,
                    canApprove: false,
                };
            case client_1.Role.DESIGNER:
                return {
                    canUpdateStatus: department === client_1.Department.DESIGN,
                    canMoveDepartment: false,
                    canApprove: false,
                };
            case client_1.Role.CLIENT:
                return {
                    canUpdateStatus: false,
                    canMoveDepartment: false,
                    canApprove: department === client_1.Department.DESIGN,
                };
            default:
                return { canUpdateStatus: false, canMoveDepartment: false, canApprove: false };
        }
    }
    async validateWorkflowPermission(projectId, action, user) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            return { valid: false, errors: ['Project not found'] };
        }
        const permissions = this.getRolePermissions(user.role, project.currentDepartment);
        const errors = [];
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
                if (user.role !== client_1.Role.ADMIN && user.role !== client_1.Role.PROJECT_MANAGER) {
                    errors.push('Only admins and project managers can start QA testing');
                }
                break;
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
};
exports.WorkflowValidatorService = WorkflowValidatorService;
exports.WorkflowValidatorService = WorkflowValidatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_rules_service_1.WorkflowRulesService])
], WorkflowValidatorService);
//# sourceMappingURL=workflow-validator.service.js.map