import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class DisableProjectDto {
  @ApiProperty({ description: 'Whether to disable or enable the project' })
  @IsBoolean()
  disabled: boolean;

  @ApiProperty({ description: 'Reason for disabling/enabling the project', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}