import { ProjectCategory, ProjectStatus } from '@prisma/client';
export declare class CreateProjectDto {
    name: string;
    office: string;
    category?: ProjectCategory;
    categoryMasterId?: string;
    pagesCount?: number;
    currentDepartmentId?: string;
    nextDepartmentId?: string;
    targetDate?: string;
    status?: ProjectStatus;
    clientName?: string;
    observations?: string;
    deviationReason?: string;
    dependency?: boolean;
    startDate?: string;
    projectCoordinatorId?: string;
    pcTeamLeadId?: string;
    salesPersonId?: string;
    scheduleKTMeeting?: boolean;
    ktMeetingDate?: string;
    ktMeetingDuration?: number;
    ktMeetingAgenda?: string;
    ktMeetingLink?: string;
    ktMeetingParticipants?: string[];
}
