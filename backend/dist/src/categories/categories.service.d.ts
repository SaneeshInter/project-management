import { PrismaService } from '../database/prisma.service';
import { CreateCategoryMasterDto } from './dto/create-category.dto';
import { UpdateCategoryMasterDto } from './dto/update-category.dto';
import { CreateCategoryDepartmentMappingDto } from './dto/create-category-department-mapping.dto';
import { UpdateCategoryDepartmentMappingDto } from './dto/update-category-department-mapping.dto';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    createCategory(createCategoryDto: CreateCategoryMasterDto): Promise<{
        departmentMappings: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            department: import(".prisma/client").$Enums.Department;
            estimatedHours: number | null;
            estimatedDays: number | null;
            categoryId: string;
            sequence: number;
            isRequired: boolean;
        }[];
    } & {
        name: string;
        description: string | null;
        id: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        defaultStartDept: import(".prisma/client").$Enums.Department;
        estimatedTotalHours: number | null;
    }>;
    findAllCategories(includeInactive?: boolean): Promise<({
        departmentMappings: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            department: import(".prisma/client").$Enums.Department;
            estimatedHours: number | null;
            estimatedDays: number | null;
            categoryId: string;
            sequence: number;
            isRequired: boolean;
        }[];
    } & {
        name: string;
        description: string | null;
        id: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        defaultStartDept: import(".prisma/client").$Enums.Department;
        estimatedTotalHours: number | null;
    })[]>;
    findCategoryById(id: string): Promise<{
        departmentMappings: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            department: import(".prisma/client").$Enums.Department;
            estimatedHours: number | null;
            estimatedDays: number | null;
            categoryId: string;
            sequence: number;
            isRequired: boolean;
        }[];
    } & {
        name: string;
        description: string | null;
        id: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        defaultStartDept: import(".prisma/client").$Enums.Department;
        estimatedTotalHours: number | null;
    }>;
    updateCategory(id: string, updateCategoryDto: UpdateCategoryMasterDto): Promise<{
        departmentMappings: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            department: import(".prisma/client").$Enums.Department;
            estimatedHours: number | null;
            estimatedDays: number | null;
            categoryId: string;
            sequence: number;
            isRequired: boolean;
        }[];
    } & {
        name: string;
        description: string | null;
        id: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        defaultStartDept: import(".prisma/client").$Enums.Department;
        estimatedTotalHours: number | null;
    }>;
    deleteCategory(id: string): Promise<{
        message: string;
    }>;
    createDepartmentMapping(createMappingDto: CreateCategoryDepartmentMappingDto): Promise<{
        category: {
            name: string;
            description: string | null;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            defaultStartDept: import(".prisma/client").$Enums.Department;
            estimatedTotalHours: number | null;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        department: import(".prisma/client").$Enums.Department;
        estimatedHours: number | null;
        estimatedDays: number | null;
        categoryId: string;
        sequence: number;
        isRequired: boolean;
    }>;
    findDepartmentMappings(categoryId: string): Promise<({
        category: {
            name: string;
            description: string | null;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            defaultStartDept: import(".prisma/client").$Enums.Department;
            estimatedTotalHours: number | null;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        department: import(".prisma/client").$Enums.Department;
        estimatedHours: number | null;
        estimatedDays: number | null;
        categoryId: string;
        sequence: number;
        isRequired: boolean;
    })[]>;
    updateDepartmentMapping(id: string, updateMappingDto: UpdateCategoryDepartmentMappingDto): Promise<{
        category: {
            name: string;
            description: string | null;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            defaultStartDept: import(".prisma/client").$Enums.Department;
            estimatedTotalHours: number | null;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        department: import(".prisma/client").$Enums.Department;
        estimatedHours: number | null;
        estimatedDays: number | null;
        categoryId: string;
        sequence: number;
        isRequired: boolean;
    }>;
    deleteDepartmentMapping(id: string): Promise<{
        message: string;
    }>;
    getCategoryWorkflow(categoryId: string): Promise<{
        category: {
            id: string;
            name: string;
            code: string;
            defaultStartDept: import(".prisma/client").$Enums.Department;
            estimatedTotalHours: number;
        };
        departments: {
            department: import(".prisma/client").$Enums.Department;
            sequence: number;
            isRequired: boolean;
            estimatedHours: number;
            estimatedDays: number;
        }[];
    }>;
    getNextDepartment(categoryId: string, currentDepartment: string): Promise<import(".prisma/client").$Enums.Department>;
    bulkCreateDepartmentMappings(categoryId: string, departments: any[]): Promise<({
        category: {
            name: string;
            description: string | null;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            defaultStartDept: import(".prisma/client").$Enums.Department;
            estimatedTotalHours: number | null;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        department: import(".prisma/client").$Enums.Department;
        estimatedHours: number | null;
        estimatedDays: number | null;
        categoryId: string;
        sequence: number;
        isRequired: boolean;
    })[]>;
}
