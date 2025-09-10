import { Department } from '@prisma/client';
export declare class CreateCategoryMasterDto {
    name: string;
    code: string;
    description?: string;
    defaultStartDept?: Department;
    estimatedTotalHours?: number;
}
