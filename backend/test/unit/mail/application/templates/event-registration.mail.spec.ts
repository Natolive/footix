import { eventRegistrationMail } from '@src/mail/application/templates/event-registration.mail.js';

describe('eventRegistrationMail', () => {
  const lea = { email: 'lea@solem.fr', firstName: 'Léa' };
  const event = {
    id: 'e1',
    title: 'Foot du jeudi',
    description: null,
    location: 'Urban Soccer',
    startsAt: new Date('2026-10-01T16:30:00Z'),
    durationMinutes: 90,
    paymentUrl: null,
  };

  it('links to the payment page when the event has one', () => {
    const mail = eventRegistrationMail(lea, { ...event, paymentUrl: 'https://pay.example/foot' });
    expect(mail.html).toContain('Payer ma place');
    expect(mail.html).toContain('https://pay.example/foot');
  });

  it('links to the events otherwise', () => {
    const mail = eventRegistrationMail(lea, event);
    expect(mail.html).not.toContain('Payer ma place');
    expect(mail.html).toContain('Voir les créneaux');
  });
});
