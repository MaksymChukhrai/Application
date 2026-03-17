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

    const organizingEvents = await this.eventRepository.find({
      where: { organizer: { id: userId } },
      relations: ['organizer', 'participants', 'tags'],
      order: { date: 'ASC' },
    });

    const attendingEvents = await this.eventRepository
      .createQueryBuilder('event')
      .innerJoin(
        'event.participants',
        'participant',
        'participant.id = :userId',
        { userId },
      )
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
        e.participants?.map((p) => `${p.firstName} ${p.lastName}`).join(', ') ||
        'none';
      const role = organizingEvents.some((o) => o.id === e.id)
        ? 'organizer'
        : 'attendee';
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
      `Attending: ${attendingEvents.length}`,
    ].join('\n');
  }

  private async callGroqApi(
    question: string,
    context: string,
  ): Promise<string> {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    const model =
      this.configService.get<string>('GROQ_MODEL') ?? 'llama-3.1-8b-instant';
    const apiUrl =
      this.configService.get<string>('GROQ_API_URL') ??
      'https://api.groq.com/openai/v1/chat/completions';

    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY is not set');
      return 'AI assistant is not configured. Please contact the administrator.';
    }

    const systemPrompt = [
      'You are a concise event management assistant with READ-ONLY access to user event data.',
      'Rules:',
      '- Answer directly. No preamble, no apologies, no filler phrases.',
      '- Never start with "Sure", "Of course", "Certainly", "I can help with that".',
      '- Use only the data provided in the context below. Do not invent or assume anything.',
      '- All event times in context are UTC. When reporting time, append "(UTC)" to be clear.',
      '- For lists, use concise bullet points.',
      '- For counts, give a direct number.',
      '- For date-based questions (e.g. "this week", "today"), compare against "Current date and time (UTC)" from context.',
      '- For tag-based questions, match against the Tags field of each event.',
      '- For participant questions, use the Participants field of the relevant event.',
      '- If the question references an event not in the context, say: "I don\'t have data on that event."',
      "- If and ONLY IF the question is completely unrelated to events or the user's data, respond with exactly:",
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
