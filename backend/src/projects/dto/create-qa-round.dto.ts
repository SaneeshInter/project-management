import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QAType } from '@prisma/client';

export class CreateQATestingRoundDto {
  @ApiProperty({ enum: QAType, example: QAType.HTML_QA })
  @IsEnum(QAType)
  qaType: QAType;

  @ApiProperty({ example: 'user-id-qa-tester' })
  @IsString()
  testedById: string;

  @ApiPropertyOptional({ example: 'Initial testing results show good progress' })
  @IsString()
  @IsOptional()
  testResults?: string;
}