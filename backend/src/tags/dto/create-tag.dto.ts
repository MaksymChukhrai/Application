import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'Tech', description: 'Unique tag name' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;
}
