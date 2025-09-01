import { DepartmentWorkStatus } from '@prisma/client';
export declare class UpdateDepartmentWorkStatusDto {
    workStatus: DepartmentWorkStatus;
    workStartDate?: string;
    workEndDate?: string;
    actualDays?: number;
    notes?: string;
}
