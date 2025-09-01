import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCustomFieldDto {
  @ApiProperty({ example: 'Budget' })
  @IsString()
  fieldName: string;

  @ApiProperty({ example: '$10,000' })
  @IsString()
  fieldValue: string;
}