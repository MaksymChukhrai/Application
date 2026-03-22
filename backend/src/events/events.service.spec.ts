import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { Event, EventVisibility } from './entities/event.entity';
import { User } from '../users/entities/user.entity';
import { Tag } from '../tags/tag.entity';
import { TagsService } from '../tags/tags.service';
import { EventsGateway } from './events.gateway';

const mockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: 'hashed',
  organizedEvents: [],
  participatedEvents: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockEvent = (overrides: Partial<Event> = {}): Event => ({
  id: 'event-1',
  title: 'Test Event',
  description: 'Test Description',
  date: new Date(Date.now() + 86400000),
  location: 'Test Location',
  capacity: 10,
  visibility: EventVisibility.PUBLIC,
  organizer: mockUser(),
  organizerId: 'user-1',
  participants: [],
  tags: [] as Tag[],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockTagsService = (): Partial<TagsService> => ({
  findByIds: jest.fn().mockResolvedValue([]),
  findAll: jest.fn().mockResolvedValue([]),
  findOrCreate: jest.fn(),
});

const mockEventsGateway = (): Partial<EventsGateway> => ({
  notifyParticipantJoined: jest.fn(),
  notifyParticipantLeft: jest.fn(),
  broadcastEventCreated: jest.fn(),
});

describe('EventsService - joinEvent', () => {
  let service: EventsService;
  let eventRepository: jest.Mocked<Repository<Event>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: TagsService,
          useValue: mockTagsService(),
        },
        {
          provide: EventsGateway,
          useValue: mockEventsGateway(),
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventRepository = module.get(getRepositoryToken(Event));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('joinEvent', () => {
    it('should successfully join an event', async function (this: void) {
      const user = mockUser({ id: 'user-2' });
      const event = mockEvent({ participants: [] });
      const updatedEvent = { ...event, participants: [user] };

      eventRepository.findOne
        .mockResolvedValueOnce(event)
        .mockResolvedValueOnce(updatedEvent as Event);
      eventRepository.save.mockResolvedValueOnce(updatedEvent as Event);

      const result = await service.joinEvent('event-1', user);

      expect(eventRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        relations: ['organizer', 'participants', 'tags'],
      });
      expect(eventRepository.save).toHaveBeenCalledTimes(1);
      expect(result.participantCount).toBe(1);
      expect(result.isJoined).toBe(true);
    });

    it('should throw NotFoundException when event does not exist', async function (this: void) {
      eventRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.joinEvent('non-existent-id', mockUser()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when user already joined', async function (this: void) {
      const user = mockUser({ id: 'user-1' });
      const event = mockEvent({ participants: [user] });

      eventRepository.findOne.mockResolvedValueOnce(event);

      await expect(service.joinEvent('event-1', user)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException when event is at full capacity', async function (this: void) {
      const user = mockUser({ id: 'user-2' });
      const existingParticipant = mockUser({ id: 'user-3' });
      const event = mockEvent({
        capacity: 1,
        participants: [existingParticipant],
      });

      eventRepository.findOne.mockResolvedValueOnce(event);

      await expect(service.joinEvent('event-1', user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should call save with updated participants list', async function (this: void) {
      const user = mockUser({ id: 'user-2' });
      const event = mockEvent({ participants: [] });
      const updatedEvent = { ...event, participants: [user] };

      eventRepository.findOne
        .mockResolvedValueOnce(event)
        .mockResolvedValueOnce(updatedEvent as Event);
      eventRepository.save.mockResolvedValueOnce(updatedEvent as Event);

      const result = await service.joinEvent('event-1', user);

      expect(eventRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        relations: ['organizer', 'participants', 'tags'],
      });
      expect(eventRepository.save).toHaveBeenCalledTimes(1);
      expect(result.participantCount).toBe(1);
      expect(result.isJoined).toBe(true);
    });
  });
});