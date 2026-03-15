import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

interface JwtUserPayload {
  id: string;
  email: string;
}

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // Public endpoint — auth optional.
  // isJoined is personalized when valid token provided, false for anonymous.
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all public events (auth optional)' })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Comma-separated tag IDs to filter by (e.g. id1,id2)',
    example: 'uuid-1,uuid-2',
  })
  @ApiResponse({ status: 200, type: [EventResponseDto] })
  async findAll(
    @Req() req: Request,
    @Query('tags') tagsQuery?: string,
  ): Promise<EventResponseDto[]> {
    const userId = (req.user as JwtUserPayload | null)?.id ?? undefined;

    // Parse comma-separated tag IDs: "id1,id2,id3" → ["id1", "id2", "id3"]
    const tagIds = tagsQuery
      ? tagsQuery
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      : undefined;

    return this.eventsService.findAllPublic(userId, tagIds);
  }

  // Public endpoint — auth optional.
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get event by id (auth optional)' })
  @ApiResponse({ status: 200, type: EventResponseDto })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<EventResponseDto> {
    const userId = (req.user as JwtUserPayload | null)?.id ?? undefined;
    return this.eventsService.findById(id, userId);
  }

  // Protected endpoints below — valid JWT required.

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, type: EventResponseDto })
  async create(
    @Body() dto: CreateEventDto,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    return this.eventsService.create(dto, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event by id (organizer only)' })
  @ApiResponse({ status: 200, type: EventResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    return this.eventsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete event by id (organizer only)' })
  @ApiResponse({ status: 204, description: 'Event deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.eventsService.delete(id, user.id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join event' })
  @ApiResponse({ status: 201, type: EventResponseDto })
  @ApiResponse({ status: 400, description: 'Event is full' })
  @ApiResponse({ status: 409, description: 'Already joined' })
  async join(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    return this.eventsService.joinEvent(id, user);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave event' })
  @ApiResponse({ status: 201, type: EventResponseDto })
  @ApiResponse({ status: 400, description: 'Not a participant' })
  async leave(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    return this.eventsService.leaveEvent(id, user.id);
  }
}
