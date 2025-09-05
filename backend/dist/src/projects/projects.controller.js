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
const update_checklist_item_dto_1 = require("./dto/update-checklist-item.dto");
const disable_project_dto_1 = require("./dto/disable-project.dto");
const update_project_status_dto_1 = require("./dto/update-project-status.dto");
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
        return this.projectsService.findAll(user.id, user.role, user);
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
    getChecklistProgress(projectId, department, user) {
        return this.projectsService.getChecklistProgress(projectId, department, user);
    }
    updateChecklistItem(projectId, itemId, updateDto, user) {
        return this.projectsService.updateChecklistItem(projectId, itemId, updateDto, user);
    }
    addChecklistItemLink(projectId, itemId, linkDto, user) {
        return this.projectsService.addChecklistItemLink(projectId, itemId, linkDto, user);
    }
    removeChecklistItemLink(projectId, itemId, linkId, user) {
        return this.projectsService.removeChecklistItemLink(projectId, itemId, linkId, user);
    }
    addChecklistItemUpdate(projectId, itemId, updateDto, user) {
        return this.projectsService.addChecklistItemUpdate(projectId, itemId, updateDto, user);
    }
    updateProjectStatus(id, updateStatusDto, user) {
        return this.projectsService.updateProjectStatus(id, updateStatusDto, user);
    }
    disableProject(id, disableDto, user) {
        return this.projectsService.disableProject(id, disableDto, user);
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
    (0, common_1.Get)(':id/checklist'),
    (0, swagger_1.ApiOperation)({ summary: 'Get checklist progress for a project department' }),
    (0, swagger_1.ApiQuery)({ name: 'department', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checklist progress retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('department')),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getChecklistProgress", null);
__decorate([
    (0, common_1.Patch)(':id/checklist/:itemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update checklist item' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checklist item updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_checklist_item_dto_1.UpdateChecklistItemDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "updateChecklistItem", null);
__decorate([
    (0, common_1.Post)(':id/checklist/:itemId/links'),
    (0, swagger_1.ApiOperation)({ summary: 'Add link to checklist item' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Link added successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_checklist_item_dto_1.CreateChecklistItemLinkDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "addChecklistItemLink", null);
__decorate([
    (0, common_1.Delete)(':id/checklist/:itemId/links/:linkId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove link from checklist item' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Link removed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Param)('linkId')),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "removeChecklistItemLink", null);
__decorate([
    (0, common_1.Post)(':id/checklist/:itemId/updates'),
    (0, swagger_1.ApiOperation)({ summary: 'Add update history to checklist item' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Update history added successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_checklist_item_dto_1.CreateChecklistItemUpdateDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "addChecklistItemUpdate", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update project status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Project status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_project_status_dto_1.UpdateProjectStatusDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "updateProjectStatus", null);
__decorate([
    (0, common_1.Patch)(':id/disable'),
    (0, swagger_1.ApiOperation)({ summary: 'Disable or enable project (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Project disabled/enabled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, disable_project_dto_1.DisableProjectDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "disableProject", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, swagger_1.ApiTags)('Projects'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map