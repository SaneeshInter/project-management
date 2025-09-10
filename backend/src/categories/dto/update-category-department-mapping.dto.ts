import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDepartmentMappingDto } from './create-category-department-mapping.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDepartmentMappingDto extends PartialType(CreateCategoryDepartmentMappingDto) {
  @ApiPropertyOptional({ description: 'Whether the mapping is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}