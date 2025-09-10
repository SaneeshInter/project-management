"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KTMeetingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const client_1 = require("@prisma/client");
let KTMeetingsService = class KTMeetingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDto, user) {
        const project = await this.prisma.project.findUnique({
            where: { id: createDto.projectId }
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${createDto.projectId} not found`);
        }
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roleMaster: true }
        });
        const userRole = userWithRole?.roleMaster?.code || user.role?.toString();
        const canCreate = userRole === 'ADMIN' || userRole === 'SU_ADMIN' ||
            userRole === 'PROJECT_MANAGER' ||
            project.ownerId === user.id ||
            project.projectCoordinatorId === user.id ||
            project.pcTeamLeadId === user.id;
        if (!canCreate) {
            throw new common_1.ForbiddenException('You do not have permission to create KT meetings for this project');
        }
        const meeting = await this.prisma.kTMeeting.create({
            data: {
                projectId: createDto.projectId,
                scheduledDate: new Date(createDto.scheduledDate),
                duration: createDto.duration || 60,
                agenda: createDto.agenda || 'Knowledge Transfer Meeting',
                meetingLink: createDto.meetingLink,
                createdById: user.id,
            },
            include: {
                project: { select: { name: true, projectCode: true } },
                createdBy: { select: { id: true, name: true, email: true } },
                participants: {
                    include: {
                        user: { select: { id: true, name: true, email: true, role: true } }
                    }
                }
            }
        });
        if (createDto.participantIds && createDto.participantIds.length > 0) {
            const participantData = createDto.participantIds.map(userId => ({
                meetingId: meeting.id,
                userId,
                role: client_1.ParticipantRole.PARTICIPANT,
                isRequired: true,
            }));
            await this.prisma.kTMeetingParticipant.createMany({
                data: participantData,
            });
        }
        return this.findOne(meeting.id, user);
    }
    async findAll(user, projectId) {
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roleMaster: true, departmentMaster: true }
        });
        const userRole = userWithRole?.roleMaster?.code || user.role?.toString();
        let where = {};
        if (projectId) {
            where.projectId = projectId;
        }
        if (userRole === 'ADMIN' || userRole === 'SU_ADMIN' || userRole === 'PROJECT_MANAGER') {
        }
        else {
            where.OR = [
                { createdById: user.id },
                { project: { ownerId: user.id } },
                { project: { projectCoordinatorId: user.id } },
                { project: { pcTeamLeadId: user.id } },
                { participants: { some: { userId: user.id } } }
            ];
        }
        return this.prisma.kTMeeting.findMany({
            where,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        projectCode: true,
                        projectCoordinator: { select: { name: true } },
                        pcTeamLead: { select: { name: true } }
                    }
                },
                createdBy: { select: { id: true, name: true, email: true } },
                participants: {
                    include: {
                        user: { select: { id: true, name: true, email: true, role: true } }
                    }
                },
                _count: {
                    select: { participants: true }
                }
            },
            orderBy: { scheduledDate: 'desc' }
        });
    }
    async findOne(id, user) {
        const meeting = await this.prisma.kTMeeting.findUnique({
            where: { id },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        projectCode: true,
                        ownerId: true,
                        projectCoordinatorId: true,
                        pcTeamLeadId: true,
                        owner: { select: { name: true, email: true } },
                        projectCoordinator: { select: { name: true, email: true } },
                        pcTeamLead: { select: { name: true, email: true } }
                    }
                },
                createdBy: { select: { id: true, name: true, email: true } },
                participants: {
                    include: {
                        user: { select: { id: true, name: true, email: true, role: true } }
                    },
                    orderBy: { role: 'asc' }
                }
            }
        });
        if (!meeting) {
            throw new common_1.NotFoundException(`KT Meeting with ID ${id} not found`);
        }
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roleMaster: true }
        });
        const userRole = userWithRole?.roleMaster?.code || user.role?.toString();
        const hasAccess = userRole === 'ADMIN' || userRole === 'SU_ADMIN' ||
            meeting.createdById === user.id ||
            meeting.project.ownerId === user.id ||
            meeting.project.projectCoordinatorId === user.id ||
            meeting.project.pcTeamLeadId === user.id ||
            meeting.participants.some(p => p.userId === user.id);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to this KT meeting');
        }
        return meeting;
    }
    async update(id, updateDto, user) {
        const meeting = await this.findOne(id, user);
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roleMaster: true }
        });
        const userRole = userWithRole?.roleMaster?.code || user.role?.toString();
        const canUpdate = userRole === 'ADMIN' || userRole === 'SU_ADMIN' ||
            meeting.createdById === user.id ||
            meeting.project.projectCoordinatorId === user.id ||
            meeting.project.pcTeamLeadId === user.id;
        if (!canUpdate) {
            throw new common_1.ForbiddenException('You do not have permission to update this KT meeting');
        }
        const updateData = {};
        if (updateDto.scheduledDate) {
            updateData.scheduledDate = new Date(updateDto.scheduledDate);
        }
        if (updateDto.duration !== undefined) {
            updateData.duration = updateDto.duration;
        }
        if (updateDto.agenda !== undefined) {
            updateData.agenda = updateDto.agenda;
        }
        if (updateDto.meetingLink !== undefined) {
            updateData.meetingLink = updateDto.meetingLink;
        }
        if (updateDto.status) {
            updateData.status = updateDto.status;
        }
        if (updateDto.notes !== undefined) {
            updateData.notes = updateDto.notes;
        }
        if (updateDto.completedAt) {
            updateData.completedAt = new Date(updateDto.completedAt);
        }
        const updatedMeeting = await this.prisma.kTMeeting.update({
            where: { id },
            data: updateData
        });
        return this.findOne(updatedMeeting.id, user);
    }
    async remove(id, user) {
        const meeting = await this.findOne(id, user);
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roleMaster: true }
        });
        const userRole = userWithRole?.roleMaster?.code || user.role?.toString();
        const canDelete = userRole === 'ADMIN' || userRole === 'SU_ADMIN' ||
            meeting.createdById === user.id;
        if (!canDelete) {
            throw new common_1.ForbiddenException('You do not have permission to delete this KT meeting');
        }
        await this.prisma.kTMeeting.delete({ where: { id } });
        return { message: 'KT Meeting deleted successfully' };
    }
    async addParticipant(meetingId, participantDto, user) {
        const meeting = await this.findOne(meetingId, user);
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roleMaster: true }
        });
        const userRole = userWithRole?.roleMaster?.code || user.role?.toString();
        const canAdd = userRole === 'ADMIN' || userRole === 'SU_ADMIN' ||
            meeting.createdById === user.id ||
            meeting.project.projectCoordinatorId === user.id ||
            meeting.project.pcTeamLeadId === user.id;
        if (!canAdd) {
            throw new common_1.ForbiddenException('You do not have permission to add participants to this meeting');
        }
        const participantUser = await this.prisma.user.findUnique({
            where: { id: participantDto.userId }
        });
        if (!participantUser) {
            throw new common_1.NotFoundException(`User with ID ${participantDto.userId} not found`);
        }
        const existingParticipant = await this.prisma.kTMeetingParticipant.findUnique({
            where: {
                meetingId_userId: {
                    meetingId,
                    userId: participantDto.userId
                }
            }
        });
        if (existingParticipant) {
            throw new common_1.ForbiddenException('User is already a participant in this meeting');
        }
        const participant = await this.prisma.kTMeetingParticipant.create({
            data: {
                meetingId,
                userId: participantDto.userId,
                role: participantDto.role || client_1.ParticipantRole.PARTICIPANT,
                isRequired: participantDto.isRequired ?? true,
            },
            include: {
                user: { select: { id: true, name: true, email: true, role: true } }
            }
        });
        return participant;
    }
    async removeParticipant(meetingId, participantUserId, user) {
        const meeting = await this.findOne(meetingId, user);
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roleMaster: true }
        });
        const userRole = userWithRole?.roleMaster?.code || user.role?.toString();
        const canRemove = userRole === 'ADMIN' || userRole === 'SU_ADMIN' ||
            meeting.createdById === user.id ||
            meeting.project.projectCoordinatorId === user.id ||
            meeting.project.pcTeamLeadId === user.id;
        if (!canRemove) {
            throw new common_1.ForbiddenException('You do not have permission to remove participants from this meeting');
        }
        await this.prisma.kTMeetingParticipant.delete({
            where: {
                meetingId_userId: {
                    meetingId,
                    userId: participantUserId
                }
            }
        });
        return { message: 'Participant removed successfully' };
    }
    async updateParticipant(meetingId, participantUserId, updateDto, user) {
        const meeting = await this.findOne(meetingId, user);
        const canUpdate = user.id === participantUserId ||
            meeting.createdById === user.id ||
            meeting.project.projectCoordinatorId === user.id ||
            meeting.project.pcTeamLeadId === user.id;
        if (!canUpdate) {
            throw new common_1.ForbiddenException('You do not have permission to update this participant');
        }
        const updateData = {};
        if (updateDto.attended !== undefined) {
            updateData.attended = updateDto.attended;
        }
        if (updateDto.role) {
            updateData.role = updateDto.role;
        }
        if (updateDto.isRequired !== undefined) {
            updateData.isRequired = updateDto.isRequired;
        }
        const participant = await this.prisma.kTMeetingParticipant.update({
            where: {
                meetingId_userId: {
                    meetingId,
                    userId: participantUserId
                }
            },
            data: updateData,
            include: {
                user: { select: { id: true, name: true, email: true, role: true } }
            }
        });
        return participant;
    }
    async getUpcomingMeetings(user, days = 7) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + days);
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roleMaster: true }
        });
        const userRole = userWithRole?.roleMaster?.code || user.role?.toString();
        let where = {
            scheduledDate: {
                gte: startDate,
                lte: endDate
            },
            status: {
                in: ['SCHEDULED', 'RESCHEDULED']
            }
        };
        if (userRole !== 'ADMIN' && userRole !== 'SU_ADMIN' && userRole !== 'PROJECT_MANAGER') {
            where.OR = [
                { createdById: user.id },
                { project: { ownerId: user.id } },
                { project: { projectCoordinatorId: user.id } },
                { project: { pcTeamLeadId: user.id } },
                { participants: { some: { userId: user.id } } }
            ];
        }
        return this.prisma.kTMeeting.findMany({
            where,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        projectCode: true
                    }
                },
                participants: {
                    where: { userId: user.id },
                    select: { role: true, isRequired: true, attended: true }
                },
                _count: {
                    select: { participants: true }
                }
            },
            orderBy: { scheduledDate: 'asc' }
        });
    }
};
exports.KTMeetingsService = KTMeetingsService;
exports.KTMeetingsService = KTMeetingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KTMeetingsService);
//# sourceMappingURL=kt-meetings.service.js.map