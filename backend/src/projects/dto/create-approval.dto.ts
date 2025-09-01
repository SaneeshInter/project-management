import { IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalType } from '@prisma/client';

export class CreateApprovalDto {
  @ApiProperty({ enum: ApprovalType, example: ApprovalType.CLIENT_APPROVAL })
  @IsEnum(ApprovalType)
  approvalType: ApprovalType;

  @ApiPropertyOptional({ example: 'Design looks great, approved for development' })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiPropertyOptional({ example: ['screenshot1.png', 'feedback.pdf'] })
  @IsArray()
  @IsOptional()
  attachments?: string[];
}