import { Department } from '@prisma/client';
export declare class CreateCategoryDepartmentMappingDto {
    categoryId: string;
    department: Department;
    sequence: number;
    isRequired?: boolean;
    estimatedHours?: number;
    estimatedDays?: number;
}
