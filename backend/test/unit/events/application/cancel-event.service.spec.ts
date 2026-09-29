import { Logger } from '@nestjs/common';
import { EventCancelledError } from '@src/events/domain/errors/event-cancelled.error.js';
import { EventNotFoundError } from '@src/events/domain/errors/event-not-found.error.js';
import { EventStartedError } from '@src/events/domain/errors/event-started.error.js';
import { match, no, setupEvents, yes } from './setup.js';

describe('CancelEventService', () => {
  let events: ReturnType<typeof setupEvents>;

  beforeEach(() => {
    events = setupEvents();
  });

  it('keeps the event listed as cancelled, emails those coming, then closes it', async () => {
    const [lea, max] = await events.people('Léa', 'Max');
    const { id } = await events.create.execute(match(1, 4));
    await events.answer.execute(id, lea, yes);
    await events.answer.execute(id, max, no);
    events.mailer.sent = [];
    const cancelled = await events.cancel.execute(id);
    expect(cancelled).toMatchObject({ cancelledAt: expect.any(String), participants: [{ id: lea.id }] });
    expect((await events.findUpcoming.execute())[0].cancelledAt).toBe(cancelled.cancelledAt);
    expect(events.mailer.sent.map((m) => [m.to.email, m.subject])).toEqual([['Léa@solem.fr', 'Match annulé : Foot du jeudi']]);
    await expect(events.cancel.execute(id)).rejects.toBeInstanceOf(EventCancelledError);
    await expect(events.answer.execute(id, max, yes)).rejects.toBeInstanceOf(EventCancelledError);
    await expect(events.addGuest.execute(id, lea.id, { name: 'Paul' })).rejects.toBeInstanceOf(EventCancelledError);
    await expect(events.update.execute(id, match(2))).rejects.toBeInstanceOf(EventCancelledError);
    // Supprimé ensuite : pas de second email.
    await events.delete.execute(id);
    expect(events.mailer.sent).toHaveLength(1);
  });

  it('cancels the event and logs the failure when an email fails', async () => {
    const logError = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    const [lea] = await events.people('Léa');
    const { id } = await events.create.execute(match(1));
    await events.answer.execute(id, lea, yes);
    events.mailer.failing = true;
    expect((await events.cancel.execute(id)).cancelledAt).not.toBeNull();
    expect(logError).toHaveBeenCalledWith('Annulation non envoyée à Léa@solem.fr', expect.any(Error));
    logError.mockRestore();
  });

  it('refuses an unknown or already started event', async () => {
    await expect(events.cancel.execute('unknown')).rejects.toBeInstanceOf(EventNotFoundError);
    const past = await events.repository.create(match(-1));
    await expect(events.cancel.execute(past.id)).rejects.toBeInstanceOf(EventStartedError);
  });
});
