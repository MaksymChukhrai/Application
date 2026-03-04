import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all public events' })
  @ApiResponse({ status: 200, type: [EventResponseDto] })
  async findAll(@CurrentUser() user: User): Promise<EventResponseDto[]> {
    return this.eventsService.findAllPublic(user?.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get event by id' })
  @ApiResponse({ status: 200, type: EventResponseDto })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    return this.eventsService.findById(id, user?.id);
  }

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
  @ApiOperation({ summary: 'Update event by id' })
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
  @ApiOperation({ summary: 'Delete event by id' })
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
