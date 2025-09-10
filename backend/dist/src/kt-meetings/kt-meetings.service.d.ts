import { PrismaService } from '../database/prisma.service';
import { User, KTMeetingStatus, ParticipantRole } from '@prisma/client';
export interface CreateKTMeetingDto {
    projectId: string;
    scheduledDate: string;
    duration?: number;
    agenda?: string;
    meetingLink?: string;
    participantIds?: string[];
}
export interface UpdateKTMeetingDto {
    scheduledDate?: string;
    duration?: number;
    agenda?: string;
    meetingLink?: string;
    status?: KTMeetingStatus;
    notes?: string;
    completedAt?: string;
}
export interface AddParticipantDto {
    userId: string;
    role?: ParticipantRole;
    isRequired?: boolean;
}
export interface UpdateParticipantDto {
    attended?: boolean;
    role?: ParticipantRole;
    isRequired?: boolean;
}
export declare class KTMeetingsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createDto: CreateKTMeetingDto, user: User): Promise<{
        project: {
            name: string;
            id: string;
            ownerId: string;
            projectCode: string;
            projectCoordinatorId: string;
            pcTeamLeadId: string;
            owner: {
                name: string;
                email: string;
            };
            projectCoordinator: {
                name: string;
                email: string;
            };
            pcTeamLead: {
                name: string;
                email: string;
            };
        };
        createdBy: {
            name: string;
            email: string;
            id: string;
        };
        participants: ({
            user: {
                name: string;
                email: string;
                id: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.ParticipantRole;
            isRequired: boolean;
            meetingId: string;
            userId: string;
            attended: boolean;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.KTMeetingStatus;
        projectId: string;
        notes: string | null;
        completedAt: Date | null;
        scheduledDate: Date;
        duration: number | null;
        agenda: string | null;
        meetingLink: string | null;
        createdById: string;
    }>;
    findAll(user: User, projectId?: string): Promise<({
        project: {
            name: string;
            id: string;
            projectCode: string;
            projectCoordinator: {
                name: string;
            };
            pcTeamLead: {
                name: string;
            };
        };
        _count: {
            participants: number;
        };
        createdBy: {
            name: string;
            email: string;
            id: string;
        };
        participants: ({
            user: {
                name: string;
                email: string;
                id: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.ParticipantRole;
            isRequired: boolean;
            meetingId: string;
            userId: string;
            attended: boolean;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.KTMeetingStatus;
        projectId: string;
        notes: string | null;
        completedAt: Date | null;
        scheduledDate: Date;
        duration: number | null;
        agenda: string | null;
        meetingLink: string | null;
        createdById: string;
    })[]>;
    findOne(id: string, user: User): Promise<{
        project: {
            name: string;
            id: string;
            ownerId: string;
            projectCode: string;
            projectCoordinatorId: string;
            pcTeamLeadId: string;
            owner: {
                name: string;
                email: string;
            };
            projectCoordinator: {
                name: string;
                email: string;
            };
            pcTeamLead: {
                name: string;
                email: string;
            };
        };
        createdBy: {
            name: string;
            email: string;
            id: string;
        };
        participants: ({
            user: {
                name: string;
                email: string;
                id: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.ParticipantRole;
            isRequired: boolean;
            meetingId: string;
            userId: string;
            attended: boolean;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.KTMeetingStatus;
        projectId: string;
        notes: string | null;
        completedAt: Date | null;
        scheduledDate: Date;
        duration: number | null;
        agenda: string | null;
        meetingLink: string | null;
        createdById: string;
    }>;
    update(id: string, updateDto: UpdateKTMeetingDto, user: User): Promise<{
        project: {
            name: string;
            id: string;
            ownerId: string;
            projectCode: string;
            projectCoordinatorId: string;
            pcTeamLeadId: string;
            owner: {
                name: string;
                email: string;
            };
            projectCoordinator: {
                name: string;
                email: string;
            };
            pcTeamLead: {
                name: string;
                email: string;
            };
        };
        createdBy: {
            name: string;
            email: string;
            id: string;
        };
        participants: ({
            user: {
                name: string;
                email: string;
                id: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.ParticipantRole;
            isRequired: boolean;
            meetingId: string;
            userId: string;
            attended: boolean;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.KTMeetingStatus;
        projectId: string;
        notes: string | null;
        completedAt: Date | null;
        scheduledDate: Date;
        duration: number | null;
        agenda: string | null;
        meetingLink: string | null;
        createdById: string;
    }>;
    remove(id: string, user: User): Promise<{
        message: string;
    }>;
    addParticipant(meetingId: string, participantDto: AddParticipantDto, user: User): Promise<{
        user: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.ParticipantRole;
        isRequired: boolean;
        meetingId: string;
        userId: string;
        attended: boolean;
    }>;
    removeParticipant(meetingId: string, participantUserId: string, user: User): Promise<{
        message: string;
    }>;
    updateParticipant(meetingId: string, participantUserId: string, updateDto: UpdateParticipantDto, user: User): Promise<{
        user: {
            name: string;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.ParticipantRole;
        isRequired: boolean;
        meetingId: string;
        userId: string;
        attended: boolean;
    }>;
    getUpcomingMeetings(user: User, days?: number): Promise<({
        project: {
            name: string;
            id: string;
            projectCode: string;
        };
        _count: {
            participants: number;
        };
        participants: {
            role: import(".prisma/client").$Enums.ParticipantRole;
            isRequired: boolean;
            attended: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.KTMeetingStatus;
        projectId: string;
        notes: string | null;
        completedAt: Date | null;
        scheduledDate: Date;
        duration: number | null;
        agenda: string | null;
        meetingLink: string | null;
        createdById: string;
    })[]>;
}
