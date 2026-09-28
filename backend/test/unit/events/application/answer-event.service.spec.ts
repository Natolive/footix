import { EventFullError } from '@src/events/domain/errors/event-full.error.js';
import { EventStartedError } from '@src/events/domain/errors/event-started.error.js';
import { match, no, setupEvents, yes } from './setup.js';

describe('AnswerEventService', () => {
  let events: ReturnType<typeof setupEvents>;

  beforeEach(() => {
    events = setupEvents();
  });

  it('fills places once per person, refuses when full, frees a place when someone declines', async () => {
    const [lea, max, tom] = await events.people('Léa', 'Max', 'Tom');
    const { id } = await events.create.execute(match(1, 2));
    await events.answer.execute(id, lea, yes);
    await events.answer.execute(id, lea, yes);
    await events.answer.execute(id, max, yes);
    await expect(events.answer.execute(id, tom, yes)).rejects.toBeInstanceOf(EventFullError);
    await events.answer.execute(id, tom, no);
    await events.answer.execute(id, lea, no);
    const names = (list: { firstName: string }[]) => list.map((p) => p.firstName);
    const event = await events.answer.execute(id, tom, yes);
    expect(names(event.participants)).toEqual(['Max', 'Tom']);
    expect(names(event.declined)).toEqual(['Léa']);
  });

  it('emails a calendar invite once per person, even if they change their mind', async () => {
    const [lea, max] = await events.people('Léa', 'Max');
    const { id, startsAt } = await events.create.execute(match(1, 1));
    await events.answer.execute(id, lea, yes);
    await events.answer.execute(id, lea, yes);
    await expect(events.answer.execute(id, max, yes)).rejects.toBeInstanceOf(EventFullError);
    await events.answer.execute(id, max, no);
    await events.answer.execute(id, lea, no);
    await events.answer.execute(id, lea, yes);
    await events.answer.execute(id, lea, no);
    await events.answer.execute(id, max, yes);
    expect(events.mailer.sent.map((m) => m.to.email)).toEqual(['Léa@solem.fr', 'Max@solem.fr']);
    expect(events.mailer.sent[0].attachments![0].content).toContain(`UID:${id}@footix`);
    // Fin du match = début + durée du créneau (90 min).
    const end = new Date(Date.parse(startsAt) + 90 * 60_000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    expect(events.mailer.sent[0].attachments![0].content).toContain(`DTEND:${end}`);
  });

  it('closes registrations once the event has started', async () => {
    const [lea] = await events.people('Léa');
    const past = await events.repository.create(match(-1));
    await expect(events.answer.execute(past.id, lea, yes)).rejects.toBeInstanceOf(EventStartedError);
    await expect(events.answer.execute(past.id, lea, no)).rejects.toBeInstanceOf(EventStartedError);
  });

  it('takes the guests away with the person who declines', async () => {
    const [lea] = await events.people('Léa');
    const { id } = await events.create.execute(match(1, 4));
    await events.answer.execute(id, lea, yes);
    await events.addGuest.execute(id, lea.id, { name: 'Paul' });
    expect((await events.answer.execute(id, lea, no)).guests).toEqual([]);
  });
});
