import { Department } from '@prisma/client';
export declare class CreateDepartmentTransitionDto {
    toDepartment: Department;
    estimatedDays?: number;
    permissionGrantedById?: string;
    notes?: string;
    assignedToId?: string;
    expectedStartDate?: string;
    expectedEndDate?: string;
    estimatedHours?: number;
    ktDocuments?: string[];
    ktNotes?: string;
}
