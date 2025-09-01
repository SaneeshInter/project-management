import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CorrectionStatus } from '@prisma/client';

export class UpdateCorrectionDto {
  @ApiPropertyOptional({ enum: CorrectionStatus, example: CorrectionStatus.RESOLVED })
  @IsEnum(CorrectionStatus)
  @IsOptional()
  status?: CorrectionStatus;

  @ApiPropertyOptional({ example: 'user456' })
  @IsString()
  @IsOptional()
  assignedToId?: string;

  @ApiPropertyOptional({ example: 'Fixed logo positioning and updated colors' })
  @IsString()
  @IsOptional()
  resolutionNotes?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @IsOptional()
  actualHours?: number;
}