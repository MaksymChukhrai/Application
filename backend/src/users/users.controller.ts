import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EventsService } from '../events/events.service';
import { EventResponseDto } from '../events/dto/event-response.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('me/events')
  @ApiOperation({
    summary: "Get current user's events (as organizer or participant)",
  })
  async getMyEvents(
    @CurrentUser() user: { id: string },
  ): Promise<EventResponseDto[]> {
    return this.eventsService.findUserEvents(user.id);
  }
}
