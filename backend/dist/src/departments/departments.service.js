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
exports.DepartmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let DepartmentsService = class DepartmentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDepartmentDto) {
        try {
            return await this.prisma.departmentMaster.create({
                data: createDepartmentDto,
                include: {
                    parent: true,
                    children: true,
                },
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Department with this name or code already exists');
            }
            throw error;
        }
    }
    async findAll() {
        return this.prisma.departmentMaster.findMany({
            include: {
                parent: true,
                children: true,
            },
            orderBy: [
                { parentId: 'asc' },
                { order: 'asc' },
                { name: 'asc' },
            ],
        });
    }
    async findMainDepartments() {
        return this.prisma.departmentMaster.findMany({
            where: {
                parentId: null,
                isActive: true,
            },
            include: {
                children: {
                    where: { isActive: true },
                    orderBy: [{ order: 'asc' }, { name: 'asc' }],
                },
            },
            orderBy: [
                { order: 'asc' },
                { name: 'asc' },
            ],
        });
    }
    async findOne(id) {
        const department = await this.prisma.departmentMaster.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
            },
        });
        if (!department) {
            throw new common_1.NotFoundException(`Department with ID ${id} not found`);
        }
        return department;
    }
    async update(id, updateDepartmentDto) {
        try {
            return await this.prisma.departmentMaster.update({
                where: { id },
                data: updateDepartmentDto,
                include: {
                    parent: true,
                    children: true,
                },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Department with ID ${id} not found`);
            }
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Department with this name or code already exists');
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            return await this.prisma.departmentMaster.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Department with ID ${id} not found`);
            }
            throw error;
        }
    }
    async findByParent(parentId) {
        return this.prisma.departmentMaster.findMany({
            where: { parentId },
            include: {
                children: true,
            },
            orderBy: [
                { order: 'asc' },
                { name: 'asc' },
            ],
        });
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map