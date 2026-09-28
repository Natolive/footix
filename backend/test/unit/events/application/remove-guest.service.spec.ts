import { GuestNotFoundError } from '@src/events/domain/errors/guest-not-found.error.js';
import { NotYourGuestError } from '@src/events/domain/errors/not-your-guest.error.js';
import { match, setupEvents, yes } from './setup.js';

describe('RemoveGuestService', () => {
  it('is done by the person who brought them or by an organiser only', async () => {
    const events = setupEvents();
    const [lea, max, orga] = await events.people('Léa', 'Max', 'Orga');
    const { id } = await events.create.execute(match(1, 4));
    await events.answer.execute(id, lea, yes);
    const [paul] = (await events.addGuest.execute(id, lea.id, { name: 'Paul' })).guests;
    const [, tom] = (await events.addGuest.execute(id, lea.id, { name: 'Tom' })).guests;
    await expect(events.removeGuest.execute(id, paul.id, { id: max.id, permissions: [] })).rejects.toBeInstanceOf(NotYourGuestError);
    await events.removeGuest.execute(id, paul.id, { id: lea.id, permissions: [] });
    const event = await events.removeGuest.execute(id, tom.id, { id: orga.id, permissions: ['planning.update_event'] });
    expect(event.guests).toEqual([]);
  });

  it('refuses a guest that is not on this event', async () => {
    const events = setupEvents();
    const [lea] = await events.people('Léa');
    const { id } = await events.create.execute(match(1));
    await expect(events.removeGuest.execute(id, 'unknown', { id: lea.id, permissions: [] })).rejects.toBeInstanceOf(GuestNotFoundError);
  });
});
