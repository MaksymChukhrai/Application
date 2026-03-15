import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Event, EventVisibility } from '../../events/entities/event.entity';
import { Tag } from '../../tags/tag.entity';

export async function runSeed(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const eventRepository = dataSource.getRepository(Event);
  const tagRepository = dataSource.getRepository(Tag);

  const existingUsers = await userRepository.count();
  if (existingUsers > 0) {
    return;
  }

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tagNames = ['tech', 'art', 'business', 'music', 'design'];
  const tags: Tag[] = [];

  for (const name of tagNames) {
    const tag = tagRepository.create({ name });
    tags.push(await tagRepository.save(tag));
  }

  const [tagTech, tagArt, tagBusiness, tagMusic, tagDesign] = tags;

  // ── Users ─────────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = userRepository.create({
    email: 'alice@example.com',
    firstName: 'Alice',
    lastName: 'Johnson',
    password: hashedPassword,
  });

  const user2 = userRepository.create({
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Smith',
    password: hashedPassword,
  });

  await userRepository.save([user1, user2]);

  // ── Dynamic dates ─────────────────────────────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const inTwoWeeks = new Date();
  inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
  inTwoWeeks.setHours(18, 30, 0, 0);

  const inOneMonth = new Date();
  inOneMonth.setDate(inOneMonth.getDate() + 30);
  inOneMonth.setHours(14, 0, 0, 0);

  // ── Events ────────────────────────────────────────────────────────────────
  const event1 = eventRepository.create({
    title: 'Tech Conference 2026',
    description:
      'Annual technology conference featuring the latest innovations in AI and machine learning.',
    date: tomorrow,
    location: 'Convention Center, San Francisco',
    capacity: 500,
    visibility: EventVisibility.PUBLIC,
    organizer: user1,
    organizerId: user1.id,
    participants: [],
    tags: [tagTech, tagBusiness],
  });

  const event2 = eventRepository.create({
    title: 'Community Networking Meetup',
    description: 'Connect with local professionals and expand your network.',
    date: inTwoWeeks,
    location: 'Downtown Coffee Shop',
    capacity: 30,
    visibility: EventVisibility.PUBLIC,
    organizer: user2,
    organizerId: user2.id,
    participants: [],
    tags: [tagBusiness, tagArt, tagMusic],
  });

  const event3 = eventRepository.create({
    title: 'Design Workshop',
    description: 'Hands-on workshop covering modern UI/UX design principles.',
    date: inOneMonth,
    location: 'Creative Space Studio',
    capacity: 20,
    visibility: EventVisibility.PUBLIC,
    organizer: user1,
    organizerId: user1.id,
    participants: [],
    tags: [tagDesign, tagArt],
  });

  await eventRepository.save([event1, event2, event3]);
}
