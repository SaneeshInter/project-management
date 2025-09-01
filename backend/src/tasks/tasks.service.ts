import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User, Role } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, user: User) {
    // Check if user has access to the project
    const project = await this.prisma.project.findUnique({
      where: { id: createTaskDto.projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${createTaskDto.projectId} not found`);
    }

    if (user.role === Role.CLIENT && project.ownerId !== user.id) {
      throw new ForbiddenException('Access denied to this project');
    }

    return this.prisma.task.create({
      data: createTaskDto,
      include: {
        assignee: {
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
  }

  async findAll(projectId?: string, assigneeId?: string, user?: User) {
    const where: any = {};

    if (projectId) {
      // Check project access for clients
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

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    // If user is client, only show tasks from their projects
    if (user && user.role === Role.CLIENT) {
      where.project = {
        ownerId: user.id,
      };
    }

    return this.prisma.task.findMany({
      where,
      include: {
        assignee: {
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: User) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
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
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check access permissions
    if (user.role === Role.CLIENT && task.project.ownerId !== user.id) {
      throw new ForbiddenException('Access denied to this task');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: User) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check permissions
    if (user.role === Role.CLIENT && task.project.ownerId !== user.id) {
      throw new ForbiddenException('Access denied to this task');
    }

    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
      include: {
        assignee: {
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
      },
    });
  }

  async remove(id: string, user: User) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check permissions
    if (user.role === Role.CLIENT && task.project.ownerId !== user.id) {
      throw new ForbiddenException('Access denied to this task');
    }

    await this.prisma.task.delete({ where: { id } });
    return { message: 'Task deleted successfully' };
  }
}