import { Department } from '@prisma/client';
export declare class CreateDepartmentTransitionDto {
    toDepartment: Department;
    estimatedDays?: number;
    permissionGrantedById?: string;
    notes?: string;
}
