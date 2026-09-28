import { EventFullError } from '@src/events/domain/errors/event-full.error.js';
import { EventStartedError } from '@src/events/domain/errors/event-started.error.js';
import { NotAttendingError } from '@src/events/domain/errors/not-attending.error.js';
import { match, setupEvents, yes } from './setup.js';

describe('AddGuestService', () => {
  it('takes a place, only for someone coming, and refuses when full', async () => {
    const events = setupEvents();
    const [lea, max] = await events.people('Léa', 'Max');
    const { id } = await events.create.execute(match(1, 2));
    await expect(events.addGuest.execute(id, lea.id, { name: 'Paul' })).rejects.toBeInstanceOf(NotAttendingError);
    await events.answer.execute(id, lea, yes);
    const event = await events.addGuest.execute(id, lea.id, { name: 'Paul' });
    expect(event.guests).toEqual([{ id: expect.any(String), name: 'Paul', invitedBy: { id: lea.id, firstName: 'Léa', lastName: 'Dupont' } }]);
    await expect(events.answer.execute(id, max, yes)).rejects.toBeInstanceOf(EventFullError);
    await expect(events.addGuest.execute(id, lea.id, { name: 'Tom' })).rejects.toBeInstanceOf(EventFullError);
  });

  it('closes once the event has started', async () => {
    const events = setupEvents();
    const [lea] = await events.people('Léa');
    const past = await events.repository.create(match(-1));
    await expect(events.addGuest.execute(past.id, lea.id, { name: 'Paul' })).rejects.toBeInstanceOf(EventStartedError);
  });
});
