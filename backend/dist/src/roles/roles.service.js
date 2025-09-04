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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let RolesService = class RolesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRoleDto) {
        try {
            return await this.prisma.roleMaster.create({
                data: createRoleDto,
                include: {
                    department: true,
                },
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Role with this name or code already exists');
            }
            throw error;
        }
    }
    async findAll() {
        return this.prisma.roleMaster.findMany({
            include: {
                department: true,
            },
            orderBy: [
                { department: { order: 'asc' } },
                { department: { name: 'asc' } },
                { name: 'asc' },
            ],
        });
    }
    async findByDepartment(departmentId) {
        return this.prisma.roleMaster.findMany({
            where: { departmentId },
            include: {
                department: true,
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const role = await this.prisma.roleMaster.findUnique({
            where: { id },
            include: {
                department: true,
            },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }
    async update(id, updateRoleDto) {
        try {
            return await this.prisma.roleMaster.update({
                where: { id },
                data: updateRoleDto,
                include: {
                    department: true,
                },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Role with ID ${id} not found`);
            }
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Role with this name or code already exists');
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            return await this.prisma.roleMaster.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Role with ID ${id} not found`);
            }
            throw error;
        }
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map