import { PrismaService } from '../database/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
export declare class DepartmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createDepartmentDto: CreateDepartmentDto): Promise<{
        parent: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
        children: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        }[];
    } & {
        id: string;
        name: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
        order: number;
    }>;
    findAll(): Promise<({
        parent: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
        children: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        }[];
    } & {
        id: string;
        name: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
        order: number;
    })[]>;
    findMainDepartments(): Promise<({
        children: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        }[];
    } & {
        id: string;
        name: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
        order: number;
    })[]>;
    findOne(id: string): Promise<{
        parent: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
        children: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        }[];
    } & {
        id: string;
        name: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
        order: number;
    }>;
    update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<{
        parent: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
        children: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        }[];
    } & {
        id: string;
        name: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
        order: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
        order: number;
    }>;
    findByParent(parentId: string | null): Promise<({
        children: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        }[];
    } & {
        id: string;
        name: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
        order: number;
    })[]>;
}
