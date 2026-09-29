import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module.js';
import { Mailer } from '@src/mail/domain/mailer.js';
import { DB, type Database } from '@src/common/infrastructure/database/database.module.js';
import { users } from '@src/users/infrastructure/user.table.js';
import { FakeMailer } from '@test/fakes/fake-mailer.js';
import { eq } from 'drizzle-orm';
import request from 'supertest';

// Parcours complet sur la vraie base (DATABASE_URL du conteneur back).
describe('Auth (e2e)', () => {
  const email = `e2e-${Date.now()}@solem.fr`;
  const account = { lastName: 'Dupont', firstName: 'Léa', email, password: '12345678' };
  let app: INestApplication;
  let db: Database;
  const mailer = new FakeMailer();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(Mailer)
      .useValue(mailer)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    db = app.get(DB);
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, email));
    await app.close();
  });

  it('signs up, confirms the email, logs in, reads the profile, then logs out', async () => {
    const http = request.agent(app.getHttpServer());

    await http.post('/auth/signup').send(account).expect(201);
    await http.post('/auth/signup').send({ ...account, email: `e2e-${Date.now()}@gmail.com` }).expect(400);
    await http.post('/auth/login').send({ email, password: account.password }).expect(403);
    await http.post('/auth/verify-email').send({ token: 'nope', password: account.password }).expect(404);
    await http.post('/auth/verify-email').send({ token: mailer.lastToken(), password: 'wrong-password' }).expect(401);
    const verified = await http.post('/auth/verify-email').send({ token: mailer.lastToken(), password: account.password });
    expect(verified.status).toBe(200);
    expect(verified.headers['set-cookie']?.[0]).toMatch(/footix_session=.+HttpOnly/);
    await http.post('/auth/signup').send(account).expect(409);
    await http.post('/auth/login').send({ email, password: 'wrong-password' }).expect(401);

    // Sans « Rester connecté » : cookie de session, effacé à la fermeture du navigateur ; avec, il a une date d'expiration.
    const remembered = await http.post('/auth/login').send({ email, password: account.password, remember: true }).expect(200);
    expect(remembered.headers['set-cookie']?.[0]).toMatch(/Expires=/);
    const login = await http.post('/auth/login').send({ email, password: account.password }).expect(200);
    expect(login.headers['set-cookie']?.[0]).toMatch(/footix_session=.+HttpOnly/);
    expect(login.headers['set-cookie']?.[0]).not.toMatch(/Expires=/);

    const me = await http.get('/auth/me').expect(200);
    expect(me.body).toEqual({ id: expect.any(String), email, firstName: 'Léa', lastName: 'Dupont', role: 'user', onboarded: false, availableDays: [], permissions: ['profile.read', 'profile.update', 'profile.change_password', 'profile.update_availability', 'profile.complete_onboarding', 'events.read', 'events.participate', 'events.invite_guest'] });

    await http.post('/auth/me/onboarding').expect(204);
    expect((await http.get('/auth/me').expect(200)).body.onboarded).toBe(true);
    const renamed = await http.patch('/auth/me').send({ firstName: 'Léna', lastName: 'Martin', email: 'autre@solem.fr' }).expect(200);
    expect(renamed.body).toMatchObject({ firstName: 'Léna', lastName: 'Martin', email });
    await http.post('/auth/me/password').send({ currentPassword: 'wrong-password', password: 'new-password' }).expect(401);
    await http.post('/auth/me/password').send({ currentPassword: account.password, password: 'new-password' }).expect(204);
    await http.post('/auth/me/password').send({ currentPassword: 'new-password', password: account.password }).expect(204);
    await http.get('/auth/me').expect(200);
    await http.put('/auth/me/availability').send({ availableDays: ['someday'] }).expect(400);
    expect((await http.put('/auth/me/availability').send({ availableDays: ['thursday', 'monday'] }).expect(200)).body.availableDays).toEqual(['monday', 'thursday']);
    await http.get('/users/availability').expect(403);
    await http.get('/roles').expect(403);
    await http.get('/users').expect(403);
    await http.get('/email-domains').expect(403);

    await db.update(users).set({ role: 'super_admin' }).where(eq(users.email, email));
    const roles = await http.get('/roles').expect(200);
    expect(roles.body).toContainEqual({ role: 'user', permissions: ['profile.read', 'profile.update', 'profile.change_password', 'profile.update_availability', 'profile.complete_onboarding', 'events.read', 'events.participate', 'events.invite_guest'], editable: true });
    await http.put('/roles/super_admin').send({ permissions: [] }).expect(403);
    await http.put('/roles/user').send({ permissions: ['nope'] }).expect(400);

    const domains = await http.get('/email-domains').expect(200);
    expect(domains.body).toContainEqual({ id: expect.any(String), domain: 'solem.fr' });
    await http.post('/email-domains').send({ domain: '@solem' }).expect(400);
    await http.post('/email-domains').send({ domain: 'Solem.fr' }).expect(409);
    const { body: added } = await http.post('/email-domains').send({ domain: `e2e-${Date.now()}.fr` }).expect(201);
    await http.delete(`/email-domains/${added.id}`).expect(204);
    await http.delete(`/email-domains/${added.id}`).expect(404);

    const availability = await http.get('/users/availability').expect(200);
    expect(availability.body.find((d: { day: string }) => d.day === 'monday').people).toContainEqual({ id: me.body.id, firstName: 'Léna', lastName: 'Martin' });
    await http.get('/users?pageSize=7').expect(400);
    const list = await http.get('/users').query({ q: 'léna martin', roles: 'super_admin', emailVerified: 'verified' }).expect(200);
    expect(list.body.page).toBe(1);
    expect(list.body.items).toContainEqual(expect.objectContaining({ email, role: 'super_admin', extraPermissions: [], emailVerified: true }));
    await http.put(`/users/${me.body.id}/role`).send({ role: 'user' }).expect(403);
    await http.put(`/users/${me.body.id}/permissions`).send({ extraPermissions: [] }).expect(403);
    await http.patch(`/users/${me.body.id}`).send({ email, firstName: 'Léo', lastName: 'Dupont' }).expect(200);
    await http.delete(`/users/${me.body.id}`).expect(403);

    await http.post('/auth/logout').expect(204);
    await http.get('/auth/me').expect(401);

    await http.post('/auth/forgot-password').send({ email: 'nobody@solem.fr' }).expect(204);
    await http.post('/auth/forgot-password').send({ email }).expect(204);
    await http.post('/auth/reset-password').send({ token: mailer.lastToken(), password: 'court' }).expect(400);
    await http.post('/auth/reset-password').send({ token: mailer.lastToken(), password: 'new-password' }).expect(200);
    await http.get('/auth/me').expect(200);
    await http.post('/auth/login').send({ email, password: 'new-password' }).expect(200);
  });

  it('limits signups per email', async () => {
    const http = request(app.getHttpServer());
    // Domaine refusé : aucun compte créé, mais chaque essai compte.
    const other = { ...account, email: `e2e-limit-${Date.now()}@gmail.com` };
    for (let i = 0; i < 3; i++) await http.post('/auth/signup').send(other).expect(400);
    await http.post('/auth/signup').send(other).expect(429);
  });
});
