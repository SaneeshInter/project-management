import { Role } from '@prisma/client';
export declare class RegisterDto {
    email: string;
    name: string;
    password: string;
    role?: Role;
    avatar?: string;
}
