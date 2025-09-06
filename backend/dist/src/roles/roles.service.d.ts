import { PrismaService } from '../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createRoleDto: CreateRoleDto): Promise<{
        department: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
    } & {
        id: string;
        name: string;
        code: string;
        description: string | null;
        departmentId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        department: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
    } & {
        id: string;
        name: string;
        code: string;
        description: string | null;
        departmentId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findByDepartment(departmentId: string): Promise<({
        department: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
    } & {
        id: string;
        name: string;
        code: string;
        description: string | null;
        departmentId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        department: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
    } & {
        id: string;
        name: string;
        code: string;
        description: string | null;
        departmentId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateRoleDto: UpdateRoleDto): Promise<{
        department: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
    } & {
        id: string;
        name: string;
        code: string;
        description: string | null;
        departmentId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        code: string;
        description: string | null;
        departmentId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
