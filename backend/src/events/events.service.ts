// backend/src/events/events.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventVisibility } from './entities/event.entity';
import { User } from '../users/entities/user.entity';
import { Tag } from '../tags/tag.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { TagsService } from '../tags/tags.service';
import { EventsGateway } from './events.gateway'; // NEW

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly tagsService: TagsService,
    private readonly eventsGateway: EventsGateway, // NEW
  ) {}

  // ─── toResponseDto (unchanged) ───────────────────────────────────────────

  private toResponseDto(
    event: Event,
    currentUserId?: string,
  ): EventResponseDto {
    const participantCount = event.participants?.length ?? 0;
    const isFull =
      event.capacity !== null && participantCount >= event.capacity;

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      capacity: event.capacity,
      visibility: event.visibility,
      organizer: {
        id: event.organizer.id,
        email: event.organizer.email,
        firstName: event.organizer.firstName,
        lastName: event.organizer.lastName,
      },
      participants:
        event.participants?.map((p) => ({
          id: p.id,
          email: p.email,
          firstName: p.firstName,
          lastName: p.lastName,
        })) ?? [],
      participantCount,
      isFull,
      isJoined: currentUserId
        ? (event.participants?.some((p) => p.id === currentUserId) ?? false)
        : false,
      tags: event.tags ?? [],
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  // ─── findAllPublic (unchanged) ────────────────────────────────────────────

  async findAllPublic(
    currentUserId?: string,
    tagIds?: string[],
  ): Promise<EventResponseDto[]> {
    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.participants', 'participants')
      .leftJoinAndSelect('event.tags', 'tags')
      .where('event.visibility = :visibility', {
        visibility: EventVisibility.PUBLIC,
      })
      .orderBy('event.date', 'ASC');

    if (tagIds && tagIds.length > 0) {
      qb.andWhere((qb2) => {
        const subQuery = qb2
          .subQuery()
          .select('et.eventId')
          .from('event_tags', 'et')
          .where('et.tagId IN (:...tagIds)')
          .groupBy('et.eventId')
          .having('COUNT(DISTINCT et.tagId) = :tagCount')
          .getQuery();
        return `event.id IN ${subQuery}`;
      })
        .setParameter('tagIds', tagIds)
        .setParameter('tagCount', tagIds.length);
    }

    const events = await qb.getMany();
    return events.map((event) => this.toResponseDto(event, currentUserId));
  }

  // ─── findById (unchanged) ─────────────────────────────────────────────────

  async findById(
    id: string,
    currentUserId?: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['organizer', 'participants', 'tags'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    return this.toResponseDto(event, currentUserId);
  }

  // ─── findUserEvents (unchanged) ───────────────────────────────────────────

  async findUserEvents(userId: string): Promise<EventResponseDto[]> {
    const events = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.participants', 'participants')
      .leftJoinAndSelect('event.tags', 'tags')
      .where('organizer.id = :userId', { userId })
      .orWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('e.id')
          .from(Event, 'e')
          .innerJoin('e.participants', 'p')
          .where('p.id = :userId')
          .getQuery();
        return `event.id IN ${subQuery}`;
      })
      .setParameter('userId', userId)
      .orderBy('event.date', 'ASC')
      .getMany();

    return events.map((event) => this.toResponseDto(event, userId));
  }

  // ─── create — UPDATED ─────────────────────────────────────────────────────

  async create(
    dto: CreateEventDto,
    organizer: User,
  ): Promise<EventResponseDto> {
    const eventDate = new Date(dto.date);
    if (eventDate <= new Date()) {
      throw new BadRequestException('Event date must be in the future');
    }

    let tags: Tag[] = [];
    if (dto.tagIds && dto.tagIds.length > 0) {
      tags = await this.tagsService.findByIds(dto.tagIds);
      if (tags.length !== dto.tagIds.length) {
        throw new BadRequestException('One or more tag IDs are invalid');
      }
    }

    const event = this.eventRepository.create({
      title: dto.title,
      description: dto.description,
      date: eventDate,
      location: dto.location,
      capacity: dto.capacity ?? null,
      visibility: dto.visibility ?? EventVisibility.PUBLIC,
      organizer,
      organizerId: organizer.id,
      participants: [],
      tags,
    });

    const saved = await this.eventRepository.save(event);

    const full = await this.eventRepository.findOne({
      where: { id: saved.id },
      relations: ['organizer', 'participants', 'tags'],
    });

    const response = this.toResponseDto(full!, organizer.id);

    // Broadcast to all connected clients that a new event was created
    this.eventsGateway.broadcastEventCreated({
      eventId: full!.id,
      title: full!.title,
      organizerName: `${organizer.firstName} ${organizer.lastName}`,
    });

    return response;
  }

  // ─── update (unchanged) ───────────────────────────────────────────────────

  async update(
    id: string,
    dto: UpdateEventDto,
    userId: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['organizer', 'participants', 'tags'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer can edit this event');
    }

    if (dto.date) {
      const eventDate = new Date(dto.date);
      if (eventDate <= new Date()) {
        throw new BadRequestException('Event date must be in the future');
      }
      event.date = eventDate;
    }

    if (dto.title !== undefined) event.title = dto.title;
    if (dto.description !== undefined) event.description = dto.description;
    if (dto.location !== undefined) event.location = dto.location;
    if (dto.capacity !== undefined) event.capacity = dto.capacity;
    if (dto.visibility !== undefined) event.visibility = dto.visibility;

    if (dto.tagIds !== undefined) {
      if (dto.tagIds.length === 0) {
        event.tags = [];
      } else {
        const tags = await this.tagsService.findByIds(dto.tagIds);
        if (tags.length !== dto.tagIds.length) {
          throw new BadRequestException('One or more tag IDs are invalid');
        }
        event.tags = tags;
      }
    }

    const updated = await this.eventRepository.save(event);

    const full = await this.eventRepository.findOne({
      where: { id: updated.id },
      relations: ['organizer', 'participants', 'tags'],
    });

    return this.toResponseDto(full!, userId);
  }

  // ─── delete (unchanged) ───────────────────────────────────────────────────

  async delete(id: string, userId: string): Promise<void> {
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer can delete this event');
    }

    await this.eventRepository.remove(event);
  }

  // ─── joinEvent — UPDATED ──────────────────────────────────────────────────

  async joinEvent(eventId: string, user: User): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['organizer', 'participants', 'tags'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    const alreadyJoined = event.participants.some((p) => p.id === user.id);
    if (alreadyJoined) {
      throw new ConflictException(
        'You are already a participant of this event',
      );
    }

    if (
      event.capacity !== null &&
      event.participants.length >= event.capacity
    ) {
      throw new BadRequestException('Event is at full capacity');
    }

    event.participants.push(user);
    const updated = await this.eventRepository.save(event);

    // Notify organizer that someone joined their event
    this.eventsGateway.notifyParticipantJoined(event.organizer.id, {
      eventId: event.id,
      eventTitle: event.title,
      userName: `${user.firstName} ${user.lastName}`,
    });

    return this.toResponseDto(updated, user.id);
  }

  // ─── leaveEvent — UPDATED ─────────────────────────────────────────────────

  async leaveEvent(eventId: string, userId: string): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['organizer', 'participants', 'tags'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    const participantIndex = event.participants.findIndex(
      (p) => p.id === userId,
    );

    if (participantIndex === -1) {
      throw new BadRequestException('You are not a participant of this event');
    }

    // Capture user data before splice for notification payload
    const leavingUser = event.participants[participantIndex];

    event.participants.splice(participantIndex, 1);
    const updated = await this.eventRepository.save(event);

    // Notify organizer that someone left their event
    this.eventsGateway.notifyParticipantLeft(event.organizer.id, {
      eventId: event.id,
      eventTitle: event.title,
      userName: `${leavingUser.firstName} ${leavingUser.lastName}`,
    });

    return this.toResponseDto(updated, userId);
  }
}