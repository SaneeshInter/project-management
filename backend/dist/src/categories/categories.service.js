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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let CategoriesService = class CategoriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCategory(createCategoryDto) {
        try {
            return await this.prisma.categoryMaster.create({
                data: createCategoryDto,
                include: {
                    departmentMappings: {
                        where: { isActive: true },
                        orderBy: { sequence: 'asc' },
                    },
                },
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Category with this name or code already exists');
            }
            throw error;
        }
    }
    async findAllCategories(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };
        return this.prisma.categoryMaster.findMany({
            where,
            include: {
                departmentMappings: {
                    where: { isActive: true },
                    orderBy: { sequence: 'asc' },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findCategoryById(id) {
        const category = await this.prisma.categoryMaster.findUnique({
            where: { id },
            include: {
                departmentMappings: {
                    where: { isActive: true },
                    orderBy: { sequence: 'asc' },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    async updateCategory(id, updateCategoryDto) {
        try {
            return await this.prisma.categoryMaster.update({
                where: { id },
                data: updateCategoryDto,
                include: {
                    departmentMappings: {
                        where: { isActive: true },
                        orderBy: { sequence: 'asc' },
                    },
                },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Category with ID ${id} not found`);
            }
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Category with this name or code already exists');
            }
            throw error;
        }
    }
    async deleteCategory(id) {
        try {
            const projectsCount = await this.prisma.project.count({
                where: { categoryMasterId: id },
            });
            if (projectsCount > 0) {
                throw new common_1.ConflictException(`Cannot delete category. It is being used by ${projectsCount} project(s)`);
            }
            await this.prisma.categoryMaster.delete({ where: { id } });
            return { message: 'Category deleted successfully' };
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Category with ID ${id} not found`);
            }
            throw error;
        }
    }
    async createDepartmentMapping(createMappingDto) {
        try {
            await this.findCategoryById(createMappingDto.categoryId);
            return await this.prisma.categoryDepartmentMapping.create({
                data: createMappingDto,
                include: {
                    category: true,
                },
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Department mapping already exists for this category and department or sequence');
            }
            throw error;
        }
    }
    async findDepartmentMappings(categoryId) {
        return this.prisma.categoryDepartmentMapping.findMany({
            where: {
                categoryId,
                isActive: true
            },
            orderBy: { sequence: 'asc' },
            include: {
                category: true,
            },
        });
    }
    async updateDepartmentMapping(id, updateMappingDto) {
        try {
            return await this.prisma.categoryDepartmentMapping.update({
                where: { id },
                data: updateMappingDto,
                include: {
                    category: true,
                },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Department mapping with ID ${id} not found`);
            }
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Department mapping already exists for this category and department or sequence');
            }
            throw error;
        }
    }
    async deleteDepartmentMapping(id) {
        try {
            await this.prisma.categoryDepartmentMapping.delete({ where: { id } });
            return { message: 'Department mapping deleted successfully' };
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Department mapping with ID ${id} not found`);
            }
            throw error;
        }
    }
    async getCategoryWorkflow(categoryId) {
        const category = await this.findCategoryById(categoryId);
        const mappings = await this.findDepartmentMappings(categoryId);
        return {
            category: {
                id: category.id,
                name: category.name,
                code: category.code,
                defaultStartDept: category.defaultStartDept,
                estimatedTotalHours: category.estimatedTotalHours,
            },
            departments: mappings.map(mapping => ({
                department: mapping.department,
                sequence: mapping.sequence,
                isRequired: mapping.isRequired,
                estimatedHours: mapping.estimatedHours,
                estimatedDays: mapping.estimatedDays,
            })),
        };
    }
    async getNextDepartment(categoryId, currentDepartment) {
        const mappings = await this.findDepartmentMappings(categoryId);
        const currentMapping = mappings.find(m => m.department === currentDepartment);
        if (!currentMapping) {
            return null;
        }
        const nextMapping = mappings.find(m => m.sequence === currentMapping.sequence + 1);
        return nextMapping ? nextMapping.department : null;
    }
    async bulkCreateDepartmentMappings(categoryId, departments) {
        await this.findCategoryById(categoryId);
        await this.prisma.categoryDepartmentMapping.deleteMany({
            where: { categoryId },
        });
        const createData = departments.map(dept => ({
            categoryId,
            department: dept.department,
            sequence: dept.sequence,
            isRequired: dept.isRequired || true,
            estimatedHours: dept.estimatedHours,
            estimatedDays: dept.estimatedDays,
        }));
        await this.prisma.categoryDepartmentMapping.createMany({
            data: createData,
        });
        return this.findDepartmentMappings(categoryId);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map