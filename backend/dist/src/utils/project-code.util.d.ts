import { Department, DepartmentWorkStatus } from '@prisma/client';
export interface DepartmentHistoryForCode {
    toDepartment: Department;
    workStatus: DepartmentWorkStatus;
    createdAt: Date;
}
export declare function generateProjectCode(departmentHistory: DepartmentHistoryForCode[]): string;
export declare function getDepartmentCode(department: Department): string;
export declare function getAllDepartmentCodes(): Record<string, string>;
