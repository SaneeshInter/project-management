import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BugSeverity } from '@prisma/client';

export class CreateQABugDto {
  @ApiProperty({ example: 'Login button not working on mobile' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'The login button does not respond to clicks on mobile devices' })
  @IsString()
  description: string;

  @ApiProperty({ enum: BugSeverity, example: BugSeverity.HIGH })
  @IsEnum(BugSeverity)
  severity: BugSeverity;

  @ApiPropertyOptional({ example: 'developer-user-id' })
  @IsString()
  @IsOptional()
  assignedToId?: string;

  @ApiPropertyOptional({ example: 'screenshot-bug-mobile.png' })
  @IsString()
  @IsOptional()
  screenshot?: string;

  @ApiPropertyOptional({ example: '1. Open mobile browser 2. Navigate to login 3. Click login button 4. Nothing happens' })
  @IsString()
  @IsOptional()
  steps?: string;
}