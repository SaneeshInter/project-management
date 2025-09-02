import { ProjectCategory, ProjectStatus, Department } from '@prisma/client';
export declare class CreateProjectDto {
    name: string;
    office: string;
    category: ProjectCategory;
    pagesCount?: number;
    currentDepartment: Department;
    nextDepartment?: Department;
    targetDate: string;
    status?: ProjectStatus;
    clientName?: string;
    observations?: string;
    deviationReason?: string;
    dependency?: boolean;
    startDate?: string;
    projectCoordinatorId?: string;
    pcTeamLeadId?: string;
}
