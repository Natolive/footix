import { match, setupEvents, yes } from './setup.js';

describe('FindUpcomingEventsService', () => {
  it('lists upcoming events only, soonest first, each with its own participants and guests', async () => {
    const events = setupEvents();
    const [lea] = await events.people('Léa');
    await events.repository.create(match(-1));
    const later = await events.create.execute(match(7));
    const soon = await events.create.execute(match(1));
    await events.answer.execute(soon.id, lea, yes);
    await events.addGuest.execute(soon.id, lea.id, { name: 'Paul' });
    expect(await events.findUpcoming.execute()).toMatchObject([
      { id: soon.id, participants: [{ id: lea.id, firstName: 'Léa', lastName: 'Dupont' }], declined: [], guests: [{ name: 'Paul' }] },
      { id: later.id, participants: [], declined: [], guests: [] },
    ]);
  });
});
