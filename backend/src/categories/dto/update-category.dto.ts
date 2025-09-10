import { PartialType } from '@nestjs/swagger';
import { CreateCategoryMasterDto } from './create-category.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryMasterDto extends PartialType(CreateCategoryMasterDto) {
  @ApiPropertyOptional({ description: 'Whether the category is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}