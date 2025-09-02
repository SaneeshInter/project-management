import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Department code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Parent department ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Whether department is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}