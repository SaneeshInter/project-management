import { IsEnum, IsOptional, IsDateString, IsInt, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DepartmentWorkStatus } from '@prisma/client';

export class UpdateDepartmentWorkStatusDto {
  @ApiProperty({ enum: DepartmentWorkStatus, example: DepartmentWorkStatus.IN_PROGRESS })
  @IsEnum(DepartmentWorkStatus)
  workStatus: DepartmentWorkStatus;

  @ApiPropertyOptional({ example: '2024-08-29T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  workStartDate?: string;

  @ApiPropertyOptional({ example: '2024-09-05T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  workEndDate?: string;

  @ApiPropertyOptional({ example: 7 })
  @IsInt()
  @IsOptional()
  actualDays?: number;

  @ApiPropertyOptional({ example: 'Work completed ahead of schedule' })
  @IsString()
  @IsOptional()
  notes?: string;
}