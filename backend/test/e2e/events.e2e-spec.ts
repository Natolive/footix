import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module.js';
import { DB, type Database } from '@src/common/infrastructure/database/database.module.js';
import { users } from '@src/users/infrastructure/user.table.js';
import { eq, inArray } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

// Organisation puis inscriptions sur la vraie base, verrou compris.
describe('Events (e2e)', () => {
  const stamp = Date.now();
  const emails = ['orga', 'lea', 'max'].map((n) => `e2e-${n}-${stamp}@solem.fr`);
  let app: INestApplication;
  let db: Database;

  const agent = async (email: string) => {
    const http = request.agent(app.getHttpServer());
    await http.post('/auth/signup').send({ lastName: 'Dupont', firstName: 'Léa', email, password: '12345678' }).expect(201);
    // Confirmation par email couverte par auth.e2e-spec.
    await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.email, email));
    await http.post('/auth/login').send({ email, password: '12345678' }).expect(200);
    return http;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    db = app.get(DB);
  });

  afterAll(async () => {
    // Les inscriptions partent en cascade ; le créneau est supprimé par le test.
    await db.delete(users).where(inArray(users.email, emails));
    await app.close();
  });

  it('creates an event, fills it, refuses one more, then deletes it', async () => {
    const [orga, lea, max] = await Promise.all(emails.map(agent));
    const event = {
      title: 'Foot du jeudi',
      location: 'Urban Soccer',
      startsAt: new Date(Date.now() + 86_400_000).toISOString(),
      durationMinutes: 90,
      maxParticipants: 2,
      paymentUrl: '',
    };

    await lea.post('/events').send(event).expect(403);
    await db.update(users).set({ role: 'admin' }).where(inArray(users.email, [emails[0]]));
    await orga.post('/events').send({ ...event, paymentUrl: 'javascript:alert(1)' }).expect(400);
    const { body: created } = await orga.post('/events').send(event).expect(201);
    expect(created).toMatchObject({ paymentUrl: null, description: null, participants: [] });
    await orga.put(`/events/${randomUUID()}`).send(event).expect(404);
    const { body: moved } = await orga.put(`/events/${created.id}`).send({ ...event, location: 'Five' }).expect(200);
    expect(moved).toMatchObject({ id: created.id, location: 'Five' });

    const answer = (http: typeof orga, attending: unknown) => http.put(`/events/${created.id}/participation`).send({ attending });
    await answer(lea, 'oui').expect(400);
    await Promise.all([orga, lea, max].map((http) => answer(http, true)));
    const { body: list } = await lea.get('/events').expect(200);
    expect(list.find((e: { id: string }) => e.id === created.id).participants).toHaveLength(2);

    const { body: declined } = await answer(orga, false).expect(200);
    expect(declined.declined).toEqual([expect.objectContaining({ firstName: 'Léa' })]);
    // Qui a eu les places dépend de l'ordre des réponses simultanées : on repart de Léa seule.
    await answer(max, false).expect(200);
    await answer(lea, true).expect(200);
    await lea.post(`/events/${created.id}/guests`).send({ name: '' }).expect(400);
    await max.post(`/events/${created.id}/guests`).send({ name: 'Paul' }).expect(409);
    await orga.put(`/events/${created.id}`).send({ ...event, maxParticipants: 2 }).expect(200);
    const { body: withGuest } = await lea.post(`/events/${created.id}/guests`).send({ name: 'Paul' }).expect(201);
    expect(withGuest.guests).toEqual([expect.objectContaining({ name: 'Paul' })]);
    await answer(max, true).expect(409);
    await max.delete(`/events/${created.id}/guests/${withGuest.guests[0].id}`).expect(403);
    await lea.delete(`/events/${created.id}/guests/${withGuest.guests[0].id}`).expect(200);
    await answer(max, true).expect(200);

    // Supprimer un compte efface ses votes et ses invités, ses places se libèrent.
    await answer(max, false).expect(200);
    await lea.post(`/events/${created.id}/guests`).send({ name: 'Paul' }).expect(201);
    const { body: leaMe } = await lea.get('/auth/me').expect(200);
    await db.update(users).set({ role: 'super_admin' }).where(eq(users.email, emails[0]));
    const { body: maxMe } = await max.get('/auth/me').expect(200);
    const { body: promoted } = await orga.put(`/users/${maxMe.id}/permissions`).send({ extraPermissions: ['users.read'] }).expect(200);
    expect(promoted.extraPermissions).toEqual(['users.read']);
    await max.get('/users').expect(200);
    await orga.delete(`/users/${leaMe.id}`).expect(204);
    const after = (await orga.get('/events').expect(200)).body.find((e: { id: string }) => e.id === created.id);
    expect(after).toMatchObject({ participants: [], guests: [] });
    expect(after.declined.map((p: { id: string }) => p.id)).not.toContain(leaMe.id);
    await orga.delete(`/events/${created.id}`).expect(204);
  });
});
