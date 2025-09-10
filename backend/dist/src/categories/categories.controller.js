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
exports.CategoriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const categories_service_1 = require("./categories.service");
const create_category_dto_1 = require("./dto/create-category.dto");
const update_category_dto_1 = require("./dto/update-category.dto");
const create_category_department_mapping_dto_1 = require("./dto/create-category-department-mapping.dto");
const update_category_department_mapping_dto_1 = require("./dto/update-category-department-mapping.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let CategoriesController = class CategoriesController {
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    createCategory(createCategoryDto) {
        return this.categoriesService.createCategory(createCategoryDto);
    }
    findAllCategories(includeInactive) {
        const includeInactiveFlag = includeInactive === 'true';
        return this.categoriesService.findAllCategories(includeInactiveFlag);
    }
    findCategoryById(id) {
        return this.categoriesService.findCategoryById(id);
    }
    updateCategory(id, updateCategoryDto) {
        return this.categoriesService.updateCategory(id, updateCategoryDto);
    }
    deleteCategory(id) {
        return this.categoriesService.deleteCategory(id);
    }
    createDepartmentMapping(categoryId, createMappingDto) {
        createMappingDto.categoryId = categoryId;
        return this.categoriesService.createDepartmentMapping(createMappingDto);
    }
    findDepartmentMappings(categoryId) {
        return this.categoriesService.findDepartmentMappings(categoryId);
    }
    updateDepartmentMapping(mappingId, updateMappingDto) {
        return this.categoriesService.updateDepartmentMapping(mappingId, updateMappingDto);
    }
    deleteDepartmentMapping(mappingId) {
        return this.categoriesService.deleteDepartmentMapping(mappingId);
    }
    getCategoryWorkflow(categoryId) {
        return this.categoriesService.getCategoryWorkflow(categoryId);
    }
    getNextDepartment(categoryId, currentDept) {
        return this.categoriesService.getNextDepartment(categoryId, currentDept);
    }
    bulkCreateDepartmentMappings(categoryId, departments) {
        return this.categoriesService.bulkCreateDepartmentMappings(categoryId, departments);
    }
};
exports.CategoriesController = CategoriesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SU_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new category' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Category created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateCategoryMasterDto]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all categories' }),
    (0, swagger_1.ApiQuery)({ name: 'includeInactive', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Categories retrieved successfully' }),
    __param(0, (0, common_1.Query)('includeInactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findAllCategories", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get category by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findCategoryById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SU_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_category_dto_1.UpdateCategoryMasterDto]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SU_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Post)(':categoryId/departments'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SU_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Add department mapping to category' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Department mapping created successfully' }),
    __param(0, (0, common_1.Param)('categoryId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_category_department_mapping_dto_1.CreateCategoryDepartmentMappingDto]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "createDepartmentMapping", null);
__decorate([
    (0, common_1.Get)(':categoryId/departments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get department mappings for category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Department mappings retrieved successfully' }),
    __param(0, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findDepartmentMappings", null);
__decorate([
    (0, common_1.Patch)('departments/:mappingId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SU_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update department mapping' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Department mapping updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department mapping not found' }),
    __param(0, (0, common_1.Param)('mappingId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_category_department_mapping_dto_1.UpdateCategoryDepartmentMappingDto]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "updateDepartmentMapping", null);
__decorate([
    (0, common_1.Delete)('departments/:mappingId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SU_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete department mapping' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Department mapping deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department mapping not found' }),
    __param(0, (0, common_1.Param)('mappingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "deleteDepartmentMapping", null);
__decorate([
    (0, common_1.Get)(':categoryId/workflow'),
    (0, swagger_1.ApiOperation)({ summary: 'Get category workflow (department sequence)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category workflow retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "getCategoryWorkflow", null);
__decorate([
    (0, common_1.Get)(':categoryId/next-department'),
    (0, swagger_1.ApiOperation)({ summary: 'Get next department in workflow' }),
    (0, swagger_1.ApiQuery)({ name: 'currentDept', required: true, description: 'Current department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Next department retrieved successfully' }),
    __param(0, (0, common_1.Param)('categoryId')),
    __param(1, (0, common_1.Query)('currentDept')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "getNextDepartment", null);
__decorate([
    (0, common_1.Post)(':categoryId/departments/bulk'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SU_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk create/update department mappings' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Department mappings created successfully' }),
    __param(0, (0, common_1.Param)('categoryId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "bulkCreateDepartmentMappings", null);
exports.CategoriesController = CategoriesController = __decorate([
    (0, swagger_1.ApiTags)('Categories'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('categories'),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService])
], CategoriesController);
//# sourceMappingURL=categories.controller.js.map