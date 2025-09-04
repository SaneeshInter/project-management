import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    try {
      return await this.prisma.departmentMaster.create({
        data: createDepartmentDto,
        include: {
          parent: true,
          children: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Department with this name or code already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.departmentMaster.findMany({
      include: {
        parent: true,
        children: true,
      },
      orderBy: [
        { parentId: 'asc' },
        { order: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findMainDepartments() {
    return this.prisma.departmentMaster.findMany({
      where: {
        parentId: null,
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: [{ order: 'asc' }, { name: 'asc' }],
        },
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.departmentMaster.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    try {
      return await this.prisma.departmentMaster.update({
        where: { id },
        data: updateDepartmentDto,
        include: {
          parent: true,
          children: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Department with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Department with this name or code already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.departmentMaster.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Department with ID ${id} not found`);
      }
      throw error;
    }
  }

  async findByParent(parentId: string | null) {
    return this.prisma.departmentMaster.findMany({
      where: { parentId },
      include: {
        children: true,
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
    });
  }
}