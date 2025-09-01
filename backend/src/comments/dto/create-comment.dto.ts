import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'This is a comment about the project progress.' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 'project-id-here' })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ example: 'task-id-here' })
  @IsString()
  @IsOptional()
  taskId?: string;
}