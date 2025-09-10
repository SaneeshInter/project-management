import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

@Injectable()
export class KTMeetingsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateKTMeetingDto, user: User) {
    // Verify project exists and user has access
    const project = await this.prisma.project.findUnique({
      where: { id: createDto.projectId }
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${createDto.projectId} not found`);
    }

    // Check if user has permission to create KT meetings for this project
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
      throw new ForbiddenException('You do not have permission to create KT meetings for this project');
    }

    // Create the meeting
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

    // Add participants if provided
    if (createDto.participantIds && createDto.participantIds.length > 0) {
      const participantData = createDto.participantIds.map(userId => ({
        meetingId: meeting.id,
        userId,
        role: ParticipantRole.PARTICIPANT,
        isRequired: true,
      }));

      await this.prisma.kTMeetingParticipant.createMany({
        data: participantData,
      });
    }

    return this.findOne(meeting.id, user);
  }

  async findAll(user: User, projectId?: string) {
    const userWithRole = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { roleMaster: true, departmentMaster: true }
    });

    const userRole = userWithRole?.roleMaster?.code || user.role?.toString();

    let where: any = {};

    // Apply project filter if provided
    if (projectId) {
      where.projectId = projectId;
    }

    // Role-based filtering
    if (userRole === 'ADMIN' || userRole === 'SU_ADMIN' || userRole === 'PROJECT_MANAGER') {
      // Super users see all meetings
    } else {
      // Other users see meetings they're involved in
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

  async findOne(id: string, user: User) {
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
      throw new NotFoundException(`KT Meeting with ID ${id} not found`);
    }

    // Check access permissions
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
      throw new ForbiddenException('You do not have access to this KT meeting');
    }

    return meeting;
  }

  async update(id: string, updateDto: UpdateKTMeetingDto, user: User) {
    const meeting = await this.findOne(id, user);

    // Check if user can update this meeting
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
      throw new ForbiddenException('You do not have permission to update this KT meeting');
    }

    const updateData: any = {};

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

  async remove(id: string, user: User) {
    const meeting = await this.findOne(id, user);

    // Only admins and meeting creators can delete meetings
    const userWithRole = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { roleMaster: true }
    });

    const userRole = userWithRole?.roleMaster?.code || user.role?.toString();
    const canDelete = userRole === 'ADMIN' || userRole === 'SU_ADMIN' || 
                     meeting.createdById === user.id;

    if (!canDelete) {
      throw new ForbiddenException('You do not have permission to delete this KT meeting');
    }

    await this.prisma.kTMeeting.delete({ where: { id } });
    return { message: 'KT Meeting deleted successfully' };
  }

  async addParticipant(meetingId: string, participantDto: AddParticipantDto, user: User) {
    const meeting = await this.findOne(meetingId, user);

    // Check if user can add participants
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
      throw new ForbiddenException('You do not have permission to add participants to this meeting');
    }

    // Verify the user exists
    const participantUser = await this.prisma.user.findUnique({
      where: { id: participantDto.userId }
    });

    if (!participantUser) {
      throw new NotFoundException(`User with ID ${participantDto.userId} not found`);
    }

    // Check if participant already exists
    const existingParticipant = await this.prisma.kTMeetingParticipant.findUnique({
      where: {
        meetingId_userId: {
          meetingId,
          userId: participantDto.userId
        }
      }
    });

    if (existingParticipant) {
      throw new ForbiddenException('User is already a participant in this meeting');
    }

    const participant = await this.prisma.kTMeetingParticipant.create({
      data: {
        meetingId,
        userId: participantDto.userId,
        role: participantDto.role || ParticipantRole.PARTICIPANT,
        isRequired: participantDto.isRequired ?? true,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    return participant;
  }

  async removeParticipant(meetingId: string, participantUserId: string, user: User) {
    const meeting = await this.findOne(meetingId, user);

    // Check permissions
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
      throw new ForbiddenException('You do not have permission to remove participants from this meeting');
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

  async updateParticipant(meetingId: string, participantUserId: string, updateDto: UpdateParticipantDto, user: User) {
    const meeting = await this.findOne(meetingId, user);

    // Allow participants to update their own attendance
    const canUpdate = user.id === participantUserId || 
                     meeting.createdById === user.id ||
                     meeting.project.projectCoordinatorId === user.id ||
                     meeting.project.pcTeamLeadId === user.id;

    if (!canUpdate) {
      throw new ForbiddenException('You do not have permission to update this participant');
    }

    const updateData: any = {};
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

  async getUpcomingMeetings(user: User, days: number = 7) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);

    const userWithRole = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { roleMaster: true }
    });

    const userRole = userWithRole?.roleMaster?.code || user.role?.toString();

    let where: any = {
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
}