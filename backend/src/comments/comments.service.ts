import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User, Role } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, user: User) {
    const { projectId, taskId } = createCommentDto;

    // Validate that either projectId or taskId is provided, but not both
    if ((!projectId && !taskId) || (projectId && taskId)) {
      throw new BadRequestException('Provide either projectId or taskId, not both');
    }

    // Check access permissions
    if (projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }
      if (user.role === Role.CLIENT && project.ownerId !== user.id) {
        throw new ForbiddenException('Access denied to this project');
      }
    }

    if (taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        include: { project: true },
      });
      if (!task) {
        throw new NotFoundException(`Task with ID ${taskId} not found`);
      }
      if (user.role === Role.CLIENT && task.project.ownerId !== user.id) {
        throw new ForbiddenException('Access denied to this task');
      }
    }

    return this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        authorId: user.id,
        projectId: projectId || null,
        taskId: taskId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: projectId ? {
          select: {
            id: true,
            name: true,
          },
        } : false,
        task: taskId ? {
          select: {
            id: true,
            title: true,
          },
        } : false,
      },
    });
  }

  async findAll(projectId?: string, taskId?: string, user?: User) {
    const where: any = {};

    if (projectId) {
      if (user && user.role === Role.CLIENT) {
        const project = await this.prisma.project.findUnique({
          where: { id: projectId },
        });
        if (project && project.ownerId !== user.id) {
          throw new ForbiddenException('Access denied to this project');
        }
      }
      where.projectId = projectId;
    }

    if (taskId) {
      if (user && user.role === Role.CLIENT) {
        const task = await this.prisma.task.findUnique({
          where: { id: taskId },
          include: { project: true },
        });
        if (task && task.project.ownerId !== user.id) {
          throw new ForbiddenException('Access denied to this task');
        }
      }
      where.taskId = taskId;
    }

    return this.prisma.comment.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: User) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Check access permissions
    const projectOwnerId = comment.project?.ownerId || comment.task?.project?.ownerId;
    if (user.role === Role.CLIENT && projectOwnerId !== user.id) {
      throw new ForbiddenException('Access denied to this comment');
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, user: User) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        project: true,
        task: {
          include: { project: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Check if user is the author or has appropriate permissions
    if (comment.authorId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, user: User) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Check if user is the author or has appropriate permissions
    if (comment.authorId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({ where: { id } });
    return { message: 'Comment deleted successfully' };
  }
}