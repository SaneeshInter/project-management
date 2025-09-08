import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    create(createRoleDto: CreateRoleDto): Promise<{
        department: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
    } & {
        name: string;
        description: string | null;
        departmentId: string;
        id: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        department: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
    } & {
        name: string;
        description: string | null;
        departmentId: string;
        id: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findByDepartment(departmentId: string): Promise<({
        department: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
    } & {
        name: string;
        description: string | null;
        departmentId: string;
        id: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        department: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
    } & {
        name: string;
        description: string | null;
        departmentId: string;
        id: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateRoleDto: UpdateRoleDto): Promise<{
        department: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
    } & {
        name: string;
        description: string | null;
        departmentId: string;
        id: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        name: string;
        description: string | null;
        departmentId: string;
        id: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
