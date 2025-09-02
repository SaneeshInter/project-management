import { IsString, IsEnum, IsOptional, IsInt, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectCategory, ProjectStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({ example: 'Room App' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Dubai' })
  @IsString()
  office: string;

  @ApiProperty({ enum: ProjectCategory, example: ProjectCategory.MOBILE_APP })
  @IsEnum(ProjectCategory)
  category: ProjectCategory;

  @ApiPropertyOptional({ example: 10 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  pagesCount?: number;

  @ApiProperty({ example: 'dept-id-123' })
  @IsString()
  currentDepartmentId: string;

  @ApiPropertyOptional({ example: 'dept-id-456' })
  @IsString()
  @IsOptional()
  nextDepartmentId?: string;

  @ApiProperty({ example: '2024-12-31T00:00:00Z' })
  @IsDateString()
  targetDate: string;

  @ApiPropertyOptional({ enum: ProjectStatus, example: ProjectStatus.ACTIVE })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional({ example: 'Client Company Inc.' })
  @IsString()
  @IsOptional()
  clientName?: string;

  @ApiPropertyOptional({ example: 'Special requirements for this project' })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiPropertyOptional({ example: 'Project delayed due to client feedback' })
  @IsString()
  @IsOptional()
  deviationReason?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  dependency?: boolean;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: 'user-id-123' })
  @IsString()
  @IsOptional()
  projectCoordinatorId?: string;

  @ApiPropertyOptional({ example: 'user-id-456' })
  @IsString()
  @IsOptional()
  pcTeamLeadId?: string;
}