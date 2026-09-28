import { Logger } from '@nestjs/common';
import { EventNotFoundError } from '@src/events/domain/errors/event-not-found.error.js';
import { match, no, setupEvents, yes } from './setup.js';

describe('DeleteEventService', () => {
  let events: ReturnType<typeof setupEvents>;

  beforeEach(() => {
    events = setupEvents();
  });

  it('emails those coming when their upcoming event is deleted', async () => {
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

  it('deletes the event and logs the failure when an email fails', async () => {
    const logError = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    const [lea] = await events.people('Léa');
    const { id } = await events.create.execute(match(1));
    await events.answer.execute(id, lea, yes);
    events.mailer.failing = true;
    await events.delete.execute(id);
    expect(events.repository.rows).toEqual([]);
    expect(logError).toHaveBeenCalledWith('Annulation non envoyée à Léa@solem.fr', expect.any(Error));
    logError.mockRestore();
  });

  it('refuses an unknown event', async () => {
    await expect(events.delete.execute('unknown')).rejects.toBeInstanceOf(EventNotFoundError);
  });
});
