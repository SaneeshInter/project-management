import { ProjectCategory, ProjectStatus } from '@prisma/client';
export declare class CreateProjectDto {
    name: string;
    office: string;
    category: ProjectCategory;
    pagesCount?: number;
    currentDepartmentId: string;
    nextDepartmentId?: string;
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
