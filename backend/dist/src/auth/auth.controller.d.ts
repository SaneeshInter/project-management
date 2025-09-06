import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
                id: string;
                name: string;
                code: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
                order: number;
            };
            roleMaster: {
                id: string;
                name: string;
                code: string;
                description: string | null;
                departmentId: string;
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
                id: string;
                name: string;
                code: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
                order: number;
            };
            roleMaster: {
                id: string;
                name: string;
                code: string;
                description: string | null;
                departmentId: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
}
