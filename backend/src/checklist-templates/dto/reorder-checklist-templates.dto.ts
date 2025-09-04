import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderChecklistTemplatesDto {
  @ApiProperty({ description: 'Array of template IDs in new order' })
  @IsArray()
  @IsString({ each: true })
  itemIds: string[];
}