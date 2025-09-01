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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const projects_service_1 = require("./projects.service");
const create_project_dto_1 = require("./dto/create-project.dto");
const update_project_dto_1 = require("./dto/update-project.dto");
const add_custom_field_dto_1 = require("./dto/add-custom-field.dto");
const create_department_transition_dto_1 = require("./dto/create-department-transition.dto");
const update_department_work_status_dto_1 = require("./dto/update-department-work-status.dto");
const create_correction_dto_1 = require("./dto/create-correction.dto");
const update_correction_dto_1 = require("./dto/update-correction.dto");
const create_approval_dto_1 = require("./dto/create-approval.dto");
const update_approval_dto_1 = require("./dto/update-approval.dto");
const create_qa_round_dto_1 = require("./dto/create-qa-round.dto");
const create_qa_bug_dto_1 = require("./dto/create-qa-bug.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const user_decorator_1 = require("../common/decorators/user.decorator");
let ProjectsController = class ProjectsController {
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    create(createProjectDto, user) {
        return this.projectsService.create(createProjectDto, user);
    }
    findAll(user) {
        return this.projectsService.findAll(user.id, user.role);
    }
    findOne(id, user) {
        return this.projectsService.findOne(id, user);
    }
    update(id, updateProjectDto, user) {
        return this.projectsService.update(id, updateProjectDto, user);
    }
    remove(id, user) {
        return this.projectsService.remove(id, user);
    }
    addCustomField(id, addCustomFieldDto, user) {
        return this.projectsService.addCustomField(id, addCustomFieldDto.fieldName, addCustomFieldDto.fieldValue, user);
    }
    moveToDepartment(id, transitionDto, user) {
        return this.projectsService.moveToDepartment(id, transitionDto, user);
    }
    getDepartmentHistory(id, user) {
        return this.projectsService.getDepartmentHistory(id, user);
    }
    updateDepartmentWorkStatus(id, statusDto, user) {
        return this.projectsService.updateDepartmentWorkStatus(id, statusDto, user);
    }
    createCorrection(projectId, historyId, correctionDto, user) {
        return this.projectsService.createCorrection(projectId, historyId, correctionDto, user);
    }
    getProjectCorrections(id, user) {
        return this.projectsService.getProjectCorrections(id, user);
    }
    updateCorrection(projectId, correctionId, updateDto, user) {
        return this.projectsService.updateCorrection(projectId, correctionId, updateDto, user);
    }
    getTimelineAnalytics(id, user) {
        return this.projectsService.getTimelineAnalytics(id, user);
    }
    requestApproval(projectId, historyId, approvalDto, user) {
        return this.projectsService.requestApproval(projectId, historyId, approvalDto.approvalType, user);
    }
    submitApproval(projectId, approvalId, updateDto, user) {
        return this.projectsService.submitApproval(approvalId, updateDto.status, updateDto.comments, updateDto.rejectionReason, user);
    }
    startQATesting(projectId, historyId, qaDto, user) {
        return this.projectsService.startQATesting(projectId, historyId, qaDto.qaType, qaDto.testedById, user);
    }
    completeQATesting(projectId, qaRoundId, completeDto, user) {
        return this.projectsService.completeQATestingRound(qaRoundId, completeDto.status, completeDto.bugsFound, completeDto.criticalBugs, completeDto.testResults, completeDto.rejectionReason);
    }
    createQABug(projectId, qaRoundId, bugDto, user) {
        return this.projectsService.createQABug(qaRoundId, bugDto, user);
    }
    getWorkflowStatus(id, user) {
        return this.projectsService.getWorkflowStatus(id);
    }
    getAllowedNextDepartments(id, user) {
        return this.projectsService.getAllowedNextDepartments(id, user);
    }
    getWorkflowValidationStatus(id, user) {
        return this.projectsService.getWorkflowValidationStatus(id, user);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new project' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Project created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_dto_1.CreateProjectDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all projects' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Projects retrieved successfully' }),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Project retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update project' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Project updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_project_dto_1.UpdateProjectDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete project' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Project deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/custom-fields'),
    (0, swagger_1.ApiOperation)({ summary: 'Add custom field to project' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Custom field added successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_custom_field_dto_1.AddCustomFieldDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "addCustomField", null);
__decorate([
    (0, common_1.Post)(':id/move-to-department'),
    (0, swagger_1.ApiOperation)({ summary: 'Move project to different department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Project moved to new department successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_department_transition_dto_1.CreateDepartmentTransitionDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "moveToDepartment", null);
__decorate([
    (0, common_1.Get)(':id/department-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project department history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Department history retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getDepartmentHistory", null);
__decorate([
    (0, common_1.Patch)(':id/department-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update department work status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Department work status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_department_work_status_dto_1.UpdateDepartmentWorkStatusDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "updateDepartmentWorkStatus", null);
__decorate([
    (0, common_1.Post)(':id/departments/:historyId/corrections'),
    (0, swagger_1.ApiOperation)({ summary: 'Create correction for department work' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Correction created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project or department history not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('historyId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_correction_dto_1.CreateCorrectionDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "createCorrection", null);
__decorate([
    (0, common_1.Get)(':id/corrections'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all corrections for project' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Corrections retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getProjectCorrections", null);
__decorate([
    (0, common_1.Patch)(':id/corrections/:correctionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update correction status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Correction updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('correctionId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_correction_dto_1.UpdateCorrectionDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "updateCorrection", null);
__decorate([
    (0, common_1.Get)(':id/timeline-analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project timeline analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Timeline analytics retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getTimelineAnalytics", null);
__decorate([
    (0, common_1.Post)(':id/departments/:historyId/request-approval'),
    (0, swagger_1.ApiOperation)({ summary: 'Request approval for a department stage' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Approval request created successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('historyId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_approval_dto_1.CreateApprovalDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "requestApproval", null);
__decorate([
    (0, common_1.Patch)(':id/approvals/:approvalId'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit approval decision (approve/reject)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Approval decision submitted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('approvalId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_approval_dto_1.UpdateApprovalDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "submitApproval", null);
__decorate([
    (0, common_1.Post)(':id/departments/:historyId/start-qa'),
    (0, swagger_1.ApiOperation)({ summary: 'Start QA testing round for a department stage' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'QA testing round started successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('historyId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_qa_round_dto_1.CreateQATestingRoundDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "startQATesting", null);
__decorate([
    (0, common_1.Patch)(':id/qa-rounds/:qaRoundId/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete QA testing round with results' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'QA testing round completed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('qaRoundId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "completeQATesting", null);
__decorate([
    (0, common_1.Post)(':id/qa-rounds/:qaRoundId/bugs'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a bug report in QA testing round' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Bug report created successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('qaRoundId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_qa_bug_dto_1.CreateQABugDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "createQABug", null);
__decorate([
    (0, common_1.Get)(':id/workflow-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get comprehensive workflow status with approvals and QA rounds' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Workflow status retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getWorkflowStatus", null);
__decorate([
    (0, common_1.Get)(':id/allowed-departments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get allowed next departments based on workflow rules' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Allowed departments retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getAllowedNextDepartments", null);
__decorate([
    (0, common_1.Get)(':id/workflow-validation'),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow validation status for frontend enforcement' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Workflow validation status retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getWorkflowValidationStatus", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, swagger_1.ApiTags)('Projects'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map