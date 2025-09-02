import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // For registration, we need to find default department and role
    // This is a registration flow, so we'll use default values
    const defaultDepartment = await this.prisma.departmentMaster.findFirst({
      where: { isActive: true }
    });
    const defaultRole = await this.prisma.roleMaster.findFirst({
      where: { isActive: true }
    });

    if (!defaultDepartment || !defaultRole) {
      throw new Error('No active departments or roles found');
    }

    const user = await this.usersService.create({
      email: registerDto.email,
      name: registerDto.name,
      roleId: defaultRole.id,
      departmentId: defaultDepartment.id,
      avatar: registerDto.avatar,
    });

    const { password, ...result } = user;
    const payload = { sub: result.id, email: result.email, role: result.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        avatar: result.avatar,
      },
    };
  }
}