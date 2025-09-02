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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../database/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const password = createUserDto.password || 'inter123';
        const hashedPassword = await bcrypt.hash(password, 12);
        const role = await this.prisma.roleMaster.findUnique({
            where: { id: createUserDto.roleId }
        });
        const department = await this.prisma.departmentMaster.findUnique({
            where: { id: createUserDto.departmentId }
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${createUserDto.roleId} not found`);
        }
        if (!department) {
            throw new common_1.NotFoundException(`Department with ID ${createUserDto.departmentId} not found`);
        }
        return this.prisma.user.create({
            data: {
                email: createUserDto.email,
                name: createUserDto.name,
                password: hashedPassword,
                roleId: createUserDto.roleId,
                departmentId: createUserDto.departmentId,
                avatar: createUserDto.avatar,
            },
            include: {
                roleMaster: true,
                departmentMaster: true,
            },
        });
    }
    async findAll() {
        return this.prisma.user.findMany({
            include: {
                roleMaster: true,
                departmentMaster: true,
            },
        });
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                roleMaster: true,
                departmentMaster: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async update(id, updateUserDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            include: {
                roleMaster: true,
                departmentMaster: true,
            },
        });
    }
    async remove(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        await this.prisma.user.delete({ where: { id } });
        return { message: 'User deleted successfully' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map