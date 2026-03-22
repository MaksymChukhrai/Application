import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';

const FUTURE_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
const PAST_DATE = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const USER_ID = 'user-123';

const mockOrganizerEvent = {
  id: 'event-1',
  title: 'React Conference',
  date: FUTURE_DATE,
  location: 'Warsaw',
  description: 'A big React event',
  capacity: 100,
  organizer: { id: USER_ID, firstName: 'John', lastName: 'Doe' },
  participants: [{ id: 'user-456', firstName: 'Jane', lastName: 'Smith' }],
  tags: [{ id: 'tag-1', name: 'tech' }],
} as unknown as Event;

const mockAttendingEvent = {
  id: 'event-2',
  title: 'Design Sprint',
  date: PAST_DATE,
  location: 'Kyiv',
  description: 'Design workshop',
  capacity: 20,
  organizer: { id: 'user-999', firstName: 'Alice', lastName: 'Wonder' },
  participants: [{ id: USER_ID, firstName: 'John', lastName: 'Doe' }],
  tags: [{ id: 'tag-2', name: 'design' }],
} as unknown as Event;

const createQueryBuilderMock = (returnValue: Event[]) => {
  const qb: Record<string, jest.Mock> = {};
  const methods = ['innerJoin', 'leftJoinAndSelect', 'orderBy'];

  qb['getMany'] = jest.fn().mockResolvedValue(returnValue);
  for (const method of methods) {
    qb[method] = jest.fn().mockReturnValue(qb);
  }

  return qb;
};

describe('AiService', () => {
  let service: AiService;
  let eventRepoFindMock: jest.Mock;
  let eventRepoQueryBuilderMock: jest.Mock;
  let configServiceGetMock: jest.Mock;

  beforeEach(async () => {
    const qb = createQueryBuilderMock([mockAttendingEvent]);

    eventRepoFindMock = jest.fn().mockResolvedValue([mockOrganizerEvent]);
    eventRepoQueryBuilderMock = jest.fn().mockReturnValue(qb);

    configServiceGetMock = jest.fn((key: string) => {
      const config: Record<string, string> = {
        GROQ_API_KEY: 'test-api-key',
        GROQ_MODEL: 'llama-3.1-8b-instant',
        GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
      };
      return config[key];
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: getRepositoryToken(Event),
          useValue: {
            find: eventRepoFindMock,
            createQueryBuilder: eventRepoQueryBuilderMock,
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: { get: configServiceGetMock },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ask()', () => {
    it('should return answer from Groq API on success', async () => {
      const mockFetchResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'You have 1 upcoming event: React Conference.',
              },
            },
          ],
        }),
        text: jest.fn(),
      };
      global.fetch = jest.fn().mockResolvedValue(mockFetchResponse);

      const result = await service.ask('What events do I have?', USER_ID);

      expect(result).toBe('You have 1 upcoming event: React Conference.');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.groq.com/openai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        }),
      );
    });

    it('should return config error message when GROQ_API_KEY is not set', async () => {
      configServiceGetMock.mockImplementation((key: string) => {
        if (key === 'GROQ_API_KEY') return undefined;
        return 'some-value';
      });
      global.fetch = jest.fn();

      const result = await service.ask('Any question', USER_ID);

      expect(result).toBe(
        'AI assistant is not configured. Please contact the administrator.',
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return fallback message when Groq API returns non-ok status', async () => {
      const mockFetchResponse = {
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      };
      global.fetch = jest.fn().mockResolvedValue(mockFetchResponse);

      const result = await service.ask('What events do I have?', USER_ID);

      expect(result).toBe(
        "Sorry, I didn't understand that. Please try rephrasing your question.",
      );
    });

    it('should return fallback message when buildContextSnapshot throws', async () => {
      eventRepoFindMock.mockRejectedValue(new Error('DB connection lost'));
      global.fetch = jest.fn();

      const result = await service.ask('List my events', USER_ID);

      expect(result).toBe(
        "Sorry, I didn't understand that. Please try rephrasing your question.",
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should pass context with upcoming and past events to Groq', async () => {
      const mockFetchResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Answer' } }],
        }),
        text: jest.fn(),
      };
      global.fetch = jest.fn().mockResolvedValue(mockFetchResponse);

      await service.ask('Show my events', USER_ID);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body as string);
      const systemPrompt = requestBody.messages[0].content as string;

      expect(systemPrompt).toContain('React Conference');
      expect(systemPrompt).toContain('UPCOMING EVENTS (1)');
      expect(systemPrompt).toContain('Design Sprint');
      expect(systemPrompt).toContain('PAST EVENTS (1)');
      expect(systemPrompt).toContain('Total events: 2');
    });

    it('should deduplicate events that appear in both organizer and attendee queries', async () => {
      eventRepoFindMock.mockResolvedValue([mockOrganizerEvent]);

      const qb = createQueryBuilderMock([mockOrganizerEvent]);
      eventRepoQueryBuilderMock.mockReturnValue(qb);

      const mockFetchResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'You have 1 event.' } }],
        }),
        text: jest.fn(),
      };
      global.fetch = jest.fn().mockResolvedValue(mockFetchResponse);

      await service.ask('How many events do I have?', USER_ID);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body as string);
      const systemPrompt = requestBody.messages[0].content as string;

      expect(systemPrompt).toContain('Total events: 1');
    });
  });
});
