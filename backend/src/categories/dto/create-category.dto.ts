import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Department } from '@prisma/client';

export class CreateCategoryMasterDto {
  @ApiProperty({ description: 'Category name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Category code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Default starting department',
    enum: Department,
    default: Department.PMO
  })
  @IsOptional()
  @IsEnum(Department)
  defaultStartDept?: Department;

  @ApiPropertyOptional({ description: 'Estimated total hours' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedTotalHours?: number;

}