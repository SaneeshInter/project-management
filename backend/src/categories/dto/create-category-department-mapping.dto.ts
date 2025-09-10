import { IsString, IsEnum, IsInt, Min, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Department } from '@prisma/client';

export class CreateCategoryDepartmentMappingDto {
  @ApiProperty({ description: 'Category ID' })
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'Department', enum: Department })
  @IsEnum(Department)
  department: Department;

  @ApiProperty({ description: 'Sequence order in workflow' })
  @IsInt()
  @Min(1)
  sequence: number;

  @ApiPropertyOptional({ description: 'Whether this department is required', default: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Estimated hours for this department' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedHours?: number;

  @ApiPropertyOptional({ description: 'Estimated days for this department' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDays?: number;
}