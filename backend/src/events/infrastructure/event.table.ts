import { boolean, integer, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from '../../users/infrastructure/user.table.js';

export const events = pgTable('events', {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  description: text(),
  location: text().notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(60),
  maxParticipants: integer('max_participants').notNull(),
  paymentUrl: text('payment_url'),
  // Annulé : reste affiché jusqu'à sa date, sondage fermé.
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const eventParticipants = pgTable(
  'event_participants',
  {
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // false : a répondu « je ne viens pas », ne prend pas de place.
    attending: boolean().notNull().default(true),
    // Email de confirmation (.ics) déjà envoyé : un seul par personne et par créneau, même si elle change d'avis.
    confirmationSentAt: timestamp('confirmation_sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.userId] })],
);

// Invités sans compte : supprimés avec le créneau ou avec la personne qui les ramène.
export const eventGuests = pgTable('event_guests', {
  id: uuid().primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
