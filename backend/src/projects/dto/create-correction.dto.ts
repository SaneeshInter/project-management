import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority } from '@prisma/client';

export class CreateCorrectionDto {
  @ApiProperty({ example: 'Design Revision' })
  @IsString()
  correctionType: string;

  @ApiProperty({ example: 'Logo needs to be updated according to brand guidelines' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'user123' })
  @IsString()
  @IsOptional()
  assignedToId?: string;

  @ApiPropertyOptional({ enum: Priority, example: Priority.HIGH })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({ example: 4 })
  @IsInt()
  @IsOptional()
  estimatedHours?: number;
}