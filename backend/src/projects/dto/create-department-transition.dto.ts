import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Department } from '@prisma/client';

export class CreateDepartmentTransitionDto {
  @ApiProperty({ enum: Department, example: Department.DESIGN })
  @IsEnum(Department)
  toDepartment: Department;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @IsOptional()
  estimatedDays?: number;

  @ApiPropertyOptional({ example: 'user123' })
  @IsString()
  @IsOptional()
  permissionGrantedById?: string;

  @ApiPropertyOptional({ example: 'Moving to design phase as requirements are finalized' })
  @IsString()
  @IsOptional()
  notes?: string;
}