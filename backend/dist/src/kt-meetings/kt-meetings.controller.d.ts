import { KTMeetingsService, CreateKTMeetingDto, UpdateKTMeetingDto, AddParticipantDto, UpdateParticipantDto } from './kt-meetings.service';
export declare class KTMeetingsController {
    private readonly ktMeetingsService;
    constructor(ktMeetingsService: KTMeetingsService);
    create(createKtMeetingDto: CreateKTMeetingDto, req: any): Promise<{
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
    findAll(req: any, projectId?: string): Promise<({
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
    getUpcoming(req: any, days: number): Promise<({
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
    findOne(id: string, req: any): Promise<{
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
    update(id: string, updateKtMeetingDto: UpdateKTMeetingDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    addParticipant(meetingId: string, addParticipantDto: AddParticipantDto, req: any): Promise<{
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
    removeParticipant(meetingId: string, userId: string, req: any): Promise<{
        message: string;
    }>;
    updateParticipant(meetingId: string, userId: string, updateParticipantDto: UpdateParticipantDto, req: any): Promise<{
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
}
