import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Role code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Role description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Department ID this role belongs to' })
  @IsString()
  departmentId: string;

  @ApiPropertyOptional({ description: 'Whether role is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}