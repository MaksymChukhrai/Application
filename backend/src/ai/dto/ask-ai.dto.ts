import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AskAiDto {
  @ApiProperty({
    description: 'Natural language question about events',
    example: 'What events am I attending this week?',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  question: string;
}