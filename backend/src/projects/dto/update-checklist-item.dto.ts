import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsArray, IsIn } from 'class-validator';

export class ChecklistItemLinkDto {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: ['document', 'link', 'reference'] })
  @IsString()
  @IsIn(['document', 'link', 'reference'])
  type: 'document' | 'link' | 'reference';
}

export class UpdateChecklistItemDto {
  @ApiProperty()
  @IsBoolean()
  isCompleted: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  completedDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [ChecklistItemLinkDto], required: false })
  @IsOptional()
  @IsArray()
  links?: ChecklistItemLinkDto[];
}

export class CreateChecklistItemLinkDto {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: ['document', 'link', 'reference'] })
  @IsString()
  @IsIn(['document', 'link', 'reference'])
  type: 'document' | 'link' | 'reference';
}

export class CreateChecklistItemUpdateDto {
  @ApiProperty()
  @IsString()
  date: string;

  @ApiProperty()
  @IsString()
  notes: string;
}