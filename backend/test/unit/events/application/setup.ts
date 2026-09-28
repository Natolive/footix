import { AddGuestService } from '@src/events/application/add-guest.service.js';
import { AnswerEventService } from '@src/events/application/answer-event.service.js';
import { CreateEventService } from '@src/events/application/create-event.service.js';
import { DeleteEventService } from '@src/events/application/delete-event.service.js';
import { FindUpcomingEventsService } from '@src/events/application/find-upcoming-events.service.js';
import { RemoveGuestService } from '@src/events/application/remove-guest.service.js';
import { UpdateEventService } from '@src/events/application/update-event.service.js';
import { FakeMailer } from '@test/fakes/fake-mailer.js';
import { InMemoryEventRepository } from '@test/fakes/in-memory-event.repository.js';
import { InMemoryUserRepository } from '@test/fakes/in-memory-user.repository.js';

const DAY = 24 * 60 * 60 * 1000;

// Créneau dans `inDays` jours (négatif : déjà commencé).
export const match = (inDays: number, maxParticipants = 2) => ({
  title: 'Foot du jeudi',
  location: 'Urban Soccer',
  startsAt: new Date(Date.now() + inDays * DAY),
  durationMinutes: 90,
  maxParticipants,
  paymentUrl: null,
  description: null,
});
export const person = (firstName: string) => ({ email: `${firstName}@solem.fr`, firstName, lastName: 'Dupont', passwordHash: 'x' });
export const yes = { attending: true };
export const no = { attending: false };

// Cas d'usage des créneaux câblés sur des fakes en mémoire.
export function setupEvents() {
  const users = new InMemoryUserRepository();
  const repository = new InMemoryEventRepository(users);
  const mailer = new FakeMailer();
  return {
    users,
    repository,
    mailer,
    // Personnes créées dans l'ordre des prénoms donnés.
    people: (...names: string[]) => Promise.all(names.map((n) => users.create(person(n)))),
    findUpcoming: new FindUpcomingEventsService(repository),
    create: new CreateEventService(repository),
    update: new UpdateEventService(repository),
    delete: new DeleteEventService(repository, mailer),
    answer: new AnswerEventService(repository, mailer),
    addGuest: new AddGuestService(repository),
    removeGuest: new RemoveGuestService(repository),
  };
}
