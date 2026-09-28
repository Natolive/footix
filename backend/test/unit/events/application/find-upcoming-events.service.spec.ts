import { match, setupEvents, yes } from './setup.js';

describe('FindUpcomingEventsService', () => {
  it('lists upcoming events only, soonest first, with their participants', async () => {
    const events = setupEvents();
    const [lea] = await events.people('Léa');
    await events.repository.create(match(-1));
    const later = await events.create.execute(match(7));
    const soon = await events.create.execute(match(1));
    await events.answer.execute(soon.id, lea, yes);
    expect(await events.findUpcoming.execute()).toMatchObject([
      { id: soon.id, participants: [{ id: lea.id, firstName: 'Léa', lastName: 'Dupont' }], declined: [], guests: [] },
      { id: later.id, participants: [], declined: [], guests: [] },
    ]);
  });
});
