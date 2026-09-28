import { TooFewPlacesError } from '@src/events/domain/errors/too-few-places.error.js';
import { match, no, setupEvents, yes } from './setup.js';

describe('UpdateEventService', () => {
  it('refuses fewer places than people coming, those who decline do not count', async () => {
    const events = setupEvents();
    const [lea, max, tom] = await events.people('Léa', 'Max', 'Tom');
    const { id } = await events.create.execute(match(1, 4));
    await events.answer.execute(id, lea, yes);
    await events.answer.execute(id, max, yes);
    await events.answer.execute(id, tom, no);
    await expect(events.update.execute(id, match(1, 1))).rejects.toBeInstanceOf(TooFewPlacesError);
    expect(await events.update.execute(id, { ...match(2, 2), location: 'Five' })).toMatchObject({ location: 'Five', maxParticipants: 2 });
  });

  it('counts guests among the places taken', async () => {
    const events = setupEvents();
    const [lea] = await events.people('Léa');
    const { id } = await events.create.execute(match(1, 2));
    await events.answer.execute(id, lea, yes);
    await events.addGuest.execute(id, lea.id, { name: 'Paul' });
    await expect(events.update.execute(id, match(1, 1))).rejects.toBeInstanceOf(TooFewPlacesError);
  });
});
