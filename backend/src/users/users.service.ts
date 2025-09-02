import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const password = createUserDto.password || 'inter123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Validate role and department exist
    const role = await this.prisma.roleMaster.findUnique({
      where: { id: createUserDto.roleId }
    });
    const department = await this.prisma.departmentMaster.findUnique({
      where: { id: createUserDto.departmentId }
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${createUserDto.roleId} not found`);
    }
    if (!department) {
      throw new NotFoundException(`Department with ID ${createUserDto.departmentId} not found`);
    }

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
        roleId: createUserDto.roleId,
        departmentId: createUserDto.departmentId,
        avatar: createUserDto.avatar,
      },
      include: {
        roleMaster: true,
        departmentMaster: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        roleMaster: true,
        departmentMaster: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roleMaster: true,
        departmentMaster: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        roleMaster: true,
        departmentMaster: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}