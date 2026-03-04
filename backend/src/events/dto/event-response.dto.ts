import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventVisibility } from '../entities/event.entity';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class EventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  location: string;

  @ApiPropertyOptional()
  capacity: number | null;

  @ApiProperty({ enum: EventVisibility })
  visibility: EventVisibility;

  @ApiProperty({ type: () => UserResponseDto })
  organizer: UserResponseDto;

  @ApiProperty({ type: () => [UserResponseDto] })
  participants: UserResponseDto[];

  @ApiProperty()
  participantCount: number;

  @ApiProperty()
  isFull: boolean;

  @ApiProperty()
  isJoined: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
