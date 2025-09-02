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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../database/prisma.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService, prisma) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const userWithDept = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: {
                departmentMaster: true,
                roleMaster: true,
            },
        });
        const payload = {
            sub: user.id,
            email: user.email,
            role: userWithDept?.roleMaster?.code || user.role,
            departmentId: userWithDept?.departmentId,
            departmentCode: userWithDept?.departmentMaster?.code
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: userWithDept?.roleMaster?.code || user.role,
                avatar: user.avatar,
                department: user.department,
                departmentMaster: userWithDept?.departmentMaster,
                roleMaster: userWithDept?.roleMaster,
            },
        };
    }
    async register(registerDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const defaultDepartment = await this.prisma.departmentMaster.findFirst({
            where: { isActive: true }
        });
        const defaultRole = await this.prisma.roleMaster.findFirst({
            where: { isActive: true }
        });
        if (!defaultDepartment || !defaultRole) {
            throw new Error('No active departments or roles found');
        }
        const user = await this.usersService.create({
            email: registerDto.email,
            name: registerDto.name,
            roleId: defaultRole.id,
            departmentId: defaultDepartment.id,
            avatar: registerDto.avatar,
        });
        const { password, ...result } = user;
        const payload = {
            sub: result.id,
            email: result.email,
            role: result.roleMaster?.code || result.role,
            departmentId: result.departmentId,
            departmentCode: result.departmentMaster?.code
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: result.id,
                email: result.email,
                name: result.name,
                role: result.roleMaster?.code || result.role,
                avatar: result.avatar,
                department: result.department,
                departmentMaster: result.departmentMaster,
                roleMaster: result.roleMaster,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map