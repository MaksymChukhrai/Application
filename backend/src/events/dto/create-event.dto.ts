import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsArray,
  IsUUID,
  ArrayMaxSize,
} from 'class-validator';
import { EventVisibility } from '../entities/event.entity';

export class CreateEventDto {
  @ApiProperty({ example: 'Tech Conference 2025' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Annual tech conference' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2025-11-15T09:00:00.000Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Convention Center, San Francisco' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ example: 500 })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({
    enum: EventVisibility,
    default: EventVisibility.PUBLIC,
  })
  @IsEnum(EventVisibility)
  @IsOptional()
  visibility?: EventVisibility;

  @ApiPropertyOptional({
    example: ['uuid-1', 'uuid-2'],
    description: 'Array of tag IDs (max 5)',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(5)
  @IsOptional()
  tagIds?: string[];
}
