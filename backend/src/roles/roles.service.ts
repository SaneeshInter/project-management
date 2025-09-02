import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      return await this.prisma.roleMaster.create({
        data: createRoleDto,
        include: {
          department: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Role with this name or code already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.roleMaster.findMany({
      include: {
        department: true,
      },
      orderBy: [
        { department: { name: 'asc' } },
        { name: 'asc' },
      ],
    });
  }

  async findByDepartment(departmentId: string) {
    return this.prisma.roleMaster.findMany({
      where: { departmentId },
      include: {
        department: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.roleMaster.findUnique({
      where: { id },
      include: {
        department: true,
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    try {
      return await this.prisma.roleMaster.update({
        where: { id },
        data: updateRoleDto,
        include: {
          department: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Role with this name or code already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.roleMaster.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      throw error;
    }
  }
}