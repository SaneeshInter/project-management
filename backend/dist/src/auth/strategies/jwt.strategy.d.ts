import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(payload: any): Promise<{
        departmentMaster: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
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
    } & {
        name: string;
        email: string;
        password: string;
        roleId: string | null;
        departmentId: string | null;
        avatar: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: import(".prisma/client").$Enums.Department | null;
        role: import(".prisma/client").$Enums.Role;
    }>;
}
export {};
