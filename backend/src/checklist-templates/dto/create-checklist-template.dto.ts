import { IsString, IsBoolean, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChecklistTemplateDto {
  @ApiProperty({ description: 'Department code' })
  @IsString()
  department: string;

  @ApiProperty({ description: 'Checklist item title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Checklist item description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Whether this item is required', default: true })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean = true;

  @ApiProperty({ description: 'Display order', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number = 0;
}