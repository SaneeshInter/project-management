import { IsString, IsEnum, IsOptional, IsInt, IsDateString, IsArray } from 'class-validator';
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

  @ApiPropertyOptional({ example: 'user456' })
  @IsString()
  @IsOptional()
  assignedToId?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsDateString()
  @IsOptional()
  expectedStartDate?: string;

  @ApiPropertyOptional({ example: '2024-01-25' })
  @IsDateString()
  @IsOptional()
  expectedEndDate?: string;

  @ApiPropertyOptional({ example: 40 })
  @IsInt()
  @IsOptional()
  estimatedHours?: number;

  @ApiPropertyOptional({ example: ['https://docs.google.com/document/d/kt-doc', 'path/to/kt-file.pdf'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ktDocuments?: string[];

  @ApiPropertyOptional({ example: 'KT session completed with development team' })
  @IsString()
  @IsOptional()
  ktNotes?: string;
}