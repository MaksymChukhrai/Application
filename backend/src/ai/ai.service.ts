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
      return await this.callGroqApi(question, context);
    } catch (error) {
      this.logger.error('AI ask failed', error);
      return "Sorry, I didn't understand that. Please try rephrasing your question.";
    }
  }

  private async buildContextSnapshot(userId: string): Promise<string> {
    const now = new Date();

    const startOfWeek = new Date(now);
    startOfWeek.setUTCDate(now.getUTCDate() - now.getUTCDay() + 1);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
    endOfWeek.setUTCHours(23, 59, 59, 999);

    const next7Days = new Date(now);
    next7Days.setUTCDate(now.getUTCDate() + 7);

    const organizingEvents = await this.eventRepository.find({
      where: { organizer: { id: userId } },
      relations: ['organizer', 'participants', 'tags'],
      order: { date: 'ASC' },
    });

    const attendingEvents = await this.eventRepository
      .createQueryBuilder('event')
      .innerJoin('event.participants', 'participant', 'participant.id = :userId', { userId })
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.participants', 'participants')
      .leftJoinAndSelect('event.tags', 'tags')
      .orderBy('event.date', 'ASC')
      .getMany();

    const allEventIds = new Set<string>();
    const allEvents: Event[] = [];

    for (const e of [...organizingEvents, ...attendingEvents]) {
      if (!allEventIds.has(e.id)) {
        allEventIds.add(e.id);
        allEvents.push(e);
      }
    }

    const formatEvent = (e: Event): string => {
      const eventDate = new Date(e.date);
      const tags = e.tags?.map((t) => t.name).join(', ') || 'none';
      const participants =
        e.participants?.map((p) => `${p.firstName} ${p.lastName}`).join(', ') || 'none';
      const role = organizingEvents.some((o) => o.id === e.id) ? 'organizer' : 'attendee';
      const status = eventDate < now ? 'past' : 'upcoming';
      const spotsLeft =
        e.capacity != null
          ? e.capacity - (e.participants?.length ?? 0)
          : 'unlimited';

      return [
        `- Title: "${e.title}"`,
        `  Date: ${eventDate.toISOString().split('T')[0]}`,
        `  Time: ${eventDate.toISOString().slice(11, 16)} (UTC)`,
        `  Location: ${e.location || 'N/A'}`,
        `  Description: ${e.description || 'N/A'}`,
        `  Tags: [${tags}]`,
        `  Role: ${role}`,
        `  Status: ${status}`,
        `  Capacity: ${e.capacity ?? 'unlimited'}`,
        `  Spots left: ${spotsLeft}`,
        `  Participants (${e.participants?.length ?? 0}): ${participants}`,
      ].join('\n');
    };

    const upcomingEvents = allEvents.filter((e) => new Date(e.date) >= now);
    const pastEvents = allEvents.filter((e) => new Date(e.date) < now);

    return [
      `Current date and time (UTC): ${now.toISOString()}`,
      `Current week (UTC): ${startOfWeek.toISOString().split('T')[0]} to ${endOfWeek.toISOString().split('T')[0]}`,
      `Next 7 days end (UTC): ${next7Days.toISOString().split('T')[0]}`,
      `User ID: ${userId}`,
      '',
      `=== UPCOMING EVENTS (${upcomingEvents.length}) ===`,
      ...upcomingEvents.map(formatEvent),
      '',
      `=== PAST EVENTS (${pastEvents.length}) ===`,
      ...pastEvents.map(formatEvent),
      '',
      `Total events: ${allEvents.length}`,
      `Organizing: ${organizingEvents.length}`,
      `Attending as participant: ${attendingEvents.length}`,
    ].join('\n');
  }

  private async callGroqApi(question: string, context: string): Promise<string> {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    const model = this.configService.get<string>('GROQ_MODEL') ?? 'llama-3.1-8b-instant';
    const apiUrl =
      this.configService.get<string>('GROQ_API_URL') ??
      'https://api.groq.com/openai/v1/chat/completions';

    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY is not set');
      return 'AI assistant is not configured. Please contact the administrator.';
    }

    const systemPrompt = [
      'You are a READ-ONLY event management assistant.',
      '',
      'ABSOLUTE RULES — never break these:',
      '1. You CANNOT create, edit, delete, or modify any data.',
      '2. You CANNOT send emails, messages, or notifications.',
      '3. You CANNOT perform any actions — only answer questions.',
      '4. If asked to perform any action (delete/create/update/send), respond with exactly:',
      '   "I\'m a read-only assistant. I can only answer questions about your events."',
      '',
      'Answer rules:',
      '- Answer directly. No preamble, no filler phrases.',
      '- Never start with "Sure", "Of course", "Certainly", "I can help with that".',
      '- Use ONLY data from the context. Never invent or assume data.',
      '- All times in context are UTC. Always append "(UTC)" when reporting time.',
      '- For "this week": use "Current week (UTC)" range from context.',
      '- For "next 7 days": use "Next 7 days end (UTC)" date from context.',
      '- For tag questions: match the Tags field exactly.',
      '- For participant questions: use the Participants field of the relevant event.',
      '- If an event is not found in context: "I don\'t have data on that event."',
      '- If the question is completely unrelated to events or user data, respond with exactly:',
      '  "Sorry, I didn\'t understand that. Please try rephrasing your question."',
      '',
      'Context:',
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
        temperature: 0.2,
        max_tokens: 1024,
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