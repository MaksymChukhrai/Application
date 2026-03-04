import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Event, EventVisibility } from '../../events/entities/event.entity';

export async function runSeed(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const eventRepository = dataSource.getRepository(Event);

  const existingUsers = await userRepository.count();
  if (existingUsers > 0) {
    return;
  }

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

  const event1 = eventRepository.create({
    title: 'Tech Conference 2025',
    description:
      'Annual technology conference featuring the latest innovations in AI and machine learning.',
    date: new Date('2025-11-15T09:00:00.000Z'),
    location: 'Convention Center, San Francisco',
    capacity: 500,
    visibility: EventVisibility.PUBLIC,
    organizer: user1,
    organizerId: user1.id,
    participants: [],
  });

  const event2 = eventRepository.create({
    title: 'Community Networking Meetup',
    description: 'Connect with local professionals and expand your network.',
    date: new Date('2025-10-20T18:30:00.000Z'),
    location: 'Downtown Coffee Shop',
    capacity: 30,
    visibility: EventVisibility.PUBLIC,
    organizer: user2,
    organizerId: user2.id,
    participants: [],
  });

  const event3 = eventRepository.create({
    title: 'Design Workshop',
    description: 'Hands-on workshop covering modern UI/UX design principles.',
    date: new Date('2025-10-25T14:00:00.000Z'),
    location: 'Creative Space Studio',
    capacity: 20,
    visibility: EventVisibility.PUBLIC,
    organizer: user1,
    organizerId: user1.id,
    participants: [],
  });

  await eventRepository.save([event1, event2, event3]);
}
