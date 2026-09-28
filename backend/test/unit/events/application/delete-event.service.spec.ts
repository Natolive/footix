import { match, no, setupEvents, yes } from './setup.js';

describe('DeleteEventService', () => {
  it('emails those coming when their upcoming event is deleted', async () => {
    const events = setupEvents();
    const [lea, max] = await events.people('Léa', 'Max');
    const { id } = await events.create.execute(match(1, 4));
    await events.answer.execute(id, lea, yes);
    await events.answer.execute(id, max, no);
    events.mailer.sent = [];
    await events.delete.execute(id);
    expect(events.mailer.sent.map((m) => [m.to.email, m.subject])).toEqual([['Léa@solem.fr', 'Match annulé : Foot du jeudi']]);
    const past = await events.repository.create(match(-1));
    await events.repository.answer(past.id, lea.id, true);
    await events.delete.execute(past.id);
    expect(events.mailer.sent).toHaveLength(1);
  });
});
