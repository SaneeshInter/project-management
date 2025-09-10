import { IsString, IsEnum, IsOptional, IsInt, IsBoolean, IsDateString, ValidateIf } from 'class-validator';
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

  @ApiPropertyOptional({ enum: ProjectCategory, example: ProjectCategory.MOBILE_APP })
  @IsEnum(ProjectCategory)
  @IsOptional()
  category?: ProjectCategory;

  @ApiPropertyOptional({ example: 'category-id-123' })
  @IsString()
  @ValidateIf((o) => !o.category)
  @IsOptional()
  categoryMasterId?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  pagesCount?: number;

  @ApiPropertyOptional({ example: 'dept-id-123' })
  @IsString()
  @IsOptional()
  currentDepartmentId?: string;

  @ApiPropertyOptional({ example: 'dept-id-456' })
  @IsString()
  @IsOptional()
  nextDepartmentId?: string;

  @ApiPropertyOptional({ example: '2024-12-31T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  targetDate?: string;

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

  @ApiPropertyOptional({ example: 'user-id-789' })
  @IsString()
  @IsOptional()
  salesPersonId?: string;

  // KT Meeting fields
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  scheduleKTMeeting?: boolean;

  @ApiPropertyOptional({ example: '2024-12-15T10:00:00Z' })
  @IsDateString()
  @IsOptional()
  ktMeetingDate?: string;

  @ApiPropertyOptional({ example: 60 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  ktMeetingDuration?: number;

  @ApiPropertyOptional({ example: 'Project knowledge transfer and workflow review' })
  @IsString()
  @IsOptional()
  ktMeetingAgenda?: string;

  @ApiPropertyOptional({ example: 'https://meet.google.com/xyz-abc-def' })
  @IsString()
  @IsOptional()
  ktMeetingLink?: string;

  @ApiPropertyOptional({ example: ['user-id-123', 'user-id-456'] })
  @IsOptional()
  ktMeetingParticipants?: string[];
}