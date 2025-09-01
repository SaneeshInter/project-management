import { Role, Department } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    name: string;
    password: string;
    role?: Role;
    department?: Department;
    avatar?: string;
}
