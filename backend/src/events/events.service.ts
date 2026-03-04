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
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

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
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  async findAllPublic(currentUserId?: string): Promise<EventResponseDto[]> {
    const events = await this.eventRepository.find({
      where: { visibility: EventVisibility.PUBLIC },
      relations: ['organizer', 'participants'],
      order: { date: 'ASC' },
    });

    return events.map((event) => this.toResponseDto(event, currentUserId));
  }

  async findById(
    id: string,
    currentUserId?: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['organizer', 'participants'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    return this.toResponseDto(event, currentUserId);
  }

  async findUserEvents(userId: string): Promise<EventResponseDto[]> {
    const events = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.participants', 'participants')
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

  async create(
    dto: CreateEventDto,
    organizer: User,
  ): Promise<EventResponseDto> {
    const eventDate = new Date(dto.date);
    if (eventDate <= new Date()) {
      throw new BadRequestException('Event date must be in the future');
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
    });

    const saved = await this.eventRepository.save(event);

    const full = await this.eventRepository.findOne({
      where: { id: saved.id },
      relations: ['organizer', 'participants'],
    });

    return this.toResponseDto(full!, organizer.id);
  }

  async update(
    id: string,
    dto: UpdateEventDto,
    userId: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['organizer', 'participants'],
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

    const updated = await this.eventRepository.save(event);
    return this.toResponseDto(updated, userId);
  }

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

  async joinEvent(eventId: string, user: User): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['organizer', 'participants'],
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
    return this.toResponseDto(updated, user.id);
  }

  async leaveEvent(eventId: string, userId: string): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['organizer', 'participants'],
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

    event.participants.splice(participantIndex, 1);
    const updated = await this.eventRepository.save(event);
    return this.toResponseDto(updated, userId);
  }
}
