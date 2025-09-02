import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    create(createDepartmentDto: CreateDepartmentDto): Promise<{
        parent: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        };
        children: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        }[];
    } & {
        name: string;
        id: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    }>;
    findAll(): Promise<({
        parent: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        };
        children: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        }[];
    } & {
        name: string;
        id: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    })[]>;
    findByParent(parentId?: string): Promise<({
        children: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        }[];
    } & {
        name: string;
        id: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        parent: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        };
        children: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        }[];
    } & {
        name: string;
        id: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    }>;
    update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<{
        parent: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        };
        children: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        }[];
    } & {
        name: string;
        id: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    }>;
}
