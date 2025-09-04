import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    private prisma;
    constructor(usersService: UsersService, jwtService: JwtService, prisma: PrismaService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            avatar: any;
            department: any;
            departmentMaster: {
                name: string;
                id: string;
                code: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
                order: number;
            };
            roleMaster: {
                name: string;
                description: string | null;
                departmentId: string;
                id: string;
                code: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            avatar: string;
            department: import(".prisma/client").$Enums.Department;
            departmentMaster: {
                name: string;
                id: string;
                code: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
                order: number;
            };
            roleMaster: {
                name: string;
                description: string | null;
                departmentId: string;
                id: string;
                code: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
}
