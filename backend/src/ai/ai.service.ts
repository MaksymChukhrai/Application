import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async ask(question: string, userId: string): Promise<string> {
    try {
      const context = await this.buildContextSnapshot(userId);
      const answer = await this.callGroqApi(question, context);
      return answer;
    } catch (error) {
      this.logger.error('AI ask failed', error);
      return "Sorry, I didn't understand that. Please try rephrasing your question.";
    }
  }

  // ─── Context builder ──────────────────────────────────────────────────────

  private async buildContextSnapshot(userId: string): Promise<string> {
    const now = new Date();

    // Events the user organizes
    const organizingEvents = await this.eventRepository.find({
      where: { organizer: { id: userId } },
      relations: ['organizer', 'participants', 'tags'],
      order: { date: 'ASC' },
    });

    // Events the user attends (as participant)
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'participatedEvents',
        'participatedEvents.organizer',
        'participatedEvents.participants',
        'participatedEvents.tags',
      ],
    });

    const attendingEvents = user?.participatedEvents ?? [];

    // Merge and deduplicate
    const allEventIds = new Set<string>();
    const allEvents: Event[] = [];

    for (const e of [...organizingEvents, ...attendingEvents]) {
      if (!allEventIds.has(e.id)) {
        allEventIds.add(e.id);
        allEvents.push(e);
      }
    }

    // Format events for prompt
    const formatEvent = (e: Event): string => {
      const eventDate = new Date(e.date);
      const isPast = eventDate < now;
      const tags = e.tags?.map((t) => t.name).join(', ') || 'none';
      const participants =
        e.participants?.map((p) => `${p.firstName} ${p.lastName}`).join(', ') ||
        'none';
      const role = organizingEvents.some((o) => o.id === e.id)
        ? 'organizer'
        : 'attendee';

      return [
        `- Title: "${e.title}"`,
        `  Date: ${eventDate.toISOString().split('T')[0]}`,
        `  Time: ${eventDate.toTimeString().slice(0, 5)}`,
        `  Location: ${e.location || 'N/A'}`,
        `  Description: ${e.description || 'N/A'}`,
        `  Tags: [${tags}]`,
        `  Role: ${role}`,
        `  Status: ${isPast ? 'past' : 'upcoming'}`,
        `  Participants (${e.participants?.length ?? 0}): ${participants}`,
      ].join('\n');
    };

    const upcomingEvents = allEvents.filter((e) => new Date(e.date) >= now);
    const pastEvents = allEvents.filter((e) => new Date(e.date) < now);

    const lines: string[] = [
      `Current date and time: ${now.toISOString()}`,
      `User ID: ${userId}`,
      '',
      `=== UPCOMING EVENTS (${upcomingEvents.length}) ===`,
      ...upcomingEvents.map(formatEvent),
      '',
      `=== PAST EVENTS (${pastEvents.length}) ===`,
      ...pastEvents.map(formatEvent),
      '',
      `Total events: ${allEvents.length}`,
    ];

    return lines.join('\n');
  }

  // ─── Groq API call ────────────────────────────────────────────────────────

  private async callGroqApi(
    question: string,
    context: string,
  ): Promise<string> {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    this.logger.log(`GROQ_API_KEY present: ${!!apiKey}, length: ${apiKey?.length ?? 0}`); 
    const model =
      this.configService.get<string>('GROQ_MODEL') ?? 'llama-3.1-8b-instant';
    const apiUrl =
      this.configService.get<string>('GROQ_API_URL') ??
      'https://api.groq.com/openai/v1/chat/completions';

    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY is not set');
      return 'Sorry, AI assistant is not configured. Please contact the administrator.';
    }

    const systemPrompt = [
  'You are a helpful event management assistant.',
  'You have READ-ONLY access to the user\'s event data.',
  'You must NOT create, edit, or delete any data.',
  'Answer questions concisely and precisely based ONLY on the provided context.',
  'Always answer directly without any preamble or apology.',
  'Never start your answer with "Sorry" unless the question is truly unrelated to events.',
  'If and ONLY IF the question is completely unrelated to events, respond with exactly:',
  '"Sorry, I didn\'t understand that. Please try rephrasing your question."',
  '',
  'Context (user\'s event data):',
      context,
    ].join('\n');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Groq API error: ${response.status} ${errorText}`);
      throw new Error(`Groq API returned ${response.status}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    return (
      data.choices[0]?.message?.content?.trim() ??
      "Sorry, I didn't understand that. Please try rephrasing your question."
    );
  }
}
