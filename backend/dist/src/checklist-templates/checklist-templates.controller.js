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
exports.ChecklistTemplatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const checklist_templates_service_1 = require("./checklist-templates.service");
const create_checklist_template_dto_1 = require("./dto/create-checklist-template.dto");
const update_checklist_template_dto_1 = require("./dto/update-checklist-template.dto");
const reorder_checklist_templates_dto_1 = require("./dto/reorder-checklist-templates.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
let ChecklistTemplatesController = class ChecklistTemplatesController {
    constructor(checklistTemplatesService) {
        this.checklistTemplatesService = checklistTemplatesService;
    }
    create(createChecklistTemplateDto) {
        return this.checklistTemplatesService.create(createChecklistTemplateDto);
    }
    findByDepartment(department) {
        return this.checklistTemplatesService.findByDepartment(department);
    }
    update(id, updateChecklistTemplateDto) {
        return this.checklistTemplatesService.update(id, updateChecklistTemplateDto);
    }
    remove(id) {
        return this.checklistTemplatesService.remove(id);
    }
    reorder(department, reorderDto) {
        return this.checklistTemplatesService.reorder(department, reorderDto.itemIds);
    }
};
exports.ChecklistTemplatesController = ChecklistTemplatesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new checklist template' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Checklist template created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_checklist_template_dto_1.CreateChecklistTemplateDto]),
    __metadata("design:returntype", void 0)
], ChecklistTemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':department'),
    (0, swagger_1.ApiOperation)({ summary: 'Get checklist templates by department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checklist templates retrieved successfully' }),
    __param(0, (0, common_1.Param)('department')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChecklistTemplatesController.prototype, "findByDepartment", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a checklist template' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checklist template updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_checklist_template_dto_1.UpdateChecklistTemplateDto]),
    __metadata("design:returntype", void 0)
], ChecklistTemplatesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a checklist template' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checklist template deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChecklistTemplatesController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':department/reorder'),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder checklist templates for a department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checklist templates reordered successfully' }),
    __param(0, (0, common_1.Param)('department')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reorder_checklist_templates_dto_1.ReorderChecklistTemplatesDto]),
    __metadata("design:returntype", void 0)
], ChecklistTemplatesController.prototype, "reorder", null);
exports.ChecklistTemplatesController = ChecklistTemplatesController = __decorate([
    (0, swagger_1.ApiTags)('Checklist Templates'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('checklist/templates'),
    __metadata("design:paramtypes", [checklist_templates_service_1.ChecklistTemplatesService])
], ChecklistTemplatesController);
//# sourceMappingURL=checklist-templates.controller.js.map