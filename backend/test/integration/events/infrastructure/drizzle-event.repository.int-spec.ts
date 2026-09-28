import { DrizzleEventRepository } from '@src/events/infrastructure/drizzle-event.repository.js';
import { events as eventsTable } from '@src/events/infrastructure/event.table.js';
import { DrizzleUserRepository } from '@src/users/infrastructure/drizzle-user.repository.js';
import { users as usersTable } from '@src/users/infrastructure/user.table.js';
import { connect, person } from '@test/integration/database.js';
import { eq, inArray } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

describe('DrizzleEventRepository', () => {
  const db = connect();
  const events = new DrizzleEventRepository(db);
  const stamp = Date.now();
  const emails = ['lea', 'max', 'tom'].map((n) => `int-event-${n}-${stamp}@solem.fr`);
  const title = `int-${stamp}`;

  afterAll(async () => {
    // Réponses et invités partent en cascade avec le créneau et les comptes.
    await db.delete(eventsTable).where(eq(eventsTable.title, title));
    await db.delete(usersTable).where(inArray(usersTable.email, emails));
    await db.$client.end();
  });

  const setup = async () => {
    const userRepository = new DrizzleUserRepository(db);
    const [lea, max, tom] = await Promise.all(emails.map((e) => userRepository.create(person(e))));
    const event = await events.create({
      title,
      description: null,
      location: 'Urban Soccer',
      startsAt: new Date(Date.now() + 86_400_000),
      durationMinutes: 90,
      maxParticipants: 2,
      paymentUrl: null,
    });
    return { lea, max, tom, event };
  };

  it('reads nothing without event ids', async () => {
    expect(await events.findParticipants([])).toEqual([]);
    expect(await events.findGuests([])).toEqual([]);
  });

  it('refuses answers and guests on an unknown event', async () => {
    const id = randomUUID();
    expect(await events.answer(id, randomUUID(), true)).toBe(false);
    expect(await events.addGuest(id, randomUUID(), 'Paul')).toBe('not_attending');
  });

  it('shares the places between people coming and their guests, under the lock', async () => {
    const { lea, max, tom, event } = await setup();
    expect(await events.addGuest(event.id, lea.id, 'Paul')).toBe('not_attending');
    expect(await events.answer(event.id, lea.id, true)).toBe(true);
    // Déjà inscrite : répondre encore « je viens » ne prend pas de place en plus.
    expect(await events.answer(event.id, lea.id, true)).toBe(true);
    expect(await events.addGuest(event.id, lea.id, 'Paul')).toBe('added');
    expect(await events.answer(event.id, max.id, true)).toBe(false);
    expect(await events.addGuest(event.id, lea.id, 'Tom')).toBe('full');
    expect(await events.answer(event.id, tom.id, false)).toBe(true);

    const [guest] = await events.findGuests([event.id]);
    expect(guest).toMatchObject({ name: 'Paul', invitedBy: { id: lea.id, firstName: 'Léa' } });
    expect((await events.findParticipants([event.id])).map((p) => [p.id, p.attending])).toEqual([
      [lea.id, true],
      [tom.id, false],
    ]);

    // Confirmation une seule fois, et seulement pour qui vient.
    expect(await events.claimConfirmation(event.id, lea.id)).toBe(true);
    expect(await events.claimConfirmation(event.id, lea.id)).toBe(false);
    expect(await events.claimConfirmation(event.id, tom.id)).toBe(false);

    await events.removeGuest(guest.id);
    expect(await events.answer(event.id, max.id, true)).toBe(true);
    // « Je ne viens pas » retire aussi les invités de la personne.
    expect(await events.answer(event.id, max.id, false)).toBe(true);
    expect(await events.addGuest(event.id, lea.id, 'Paul')).toBe('added');
    expect(await events.answer(event.id, lea.id, false)).toBe(true);
    expect(await events.findGuests([event.id])).toEqual([]);
  });

  it('lists upcoming events only, soonest first', async () => {
    const upcoming = await events.findUpcoming(new Date());
    expect(upcoming.every((e) => e.startsAt > new Date())).toBe(true);
    expect(upcoming.map((e) => e.startsAt.getTime())).toEqual(upcoming.map((e) => e.startsAt.getTime()).toSorted((a, b) => a - b));
  });
});
