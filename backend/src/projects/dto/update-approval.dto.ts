import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalStatus } from '@prisma/client';

export class UpdateApprovalDto {
  @ApiProperty({ enum: ApprovalStatus, example: ApprovalStatus.APPROVED })
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;

  @ApiPropertyOptional({ example: 'Design approved with minor suggestions' })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiPropertyOptional({ example: 'Color scheme needs adjustment' })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}