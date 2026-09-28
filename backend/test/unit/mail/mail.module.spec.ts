import { Test } from '@nestjs/testing';

// Le choix se fait au chargement du module : on le recharge à chaque cas (classes rechargées aussi, d'où le nom).
const mailerWith = async (mailpitUrl: string) => {
  vi.resetModules();
  vi.stubEnv('MAILPIT_URL', mailpitUrl);
  const { MailModule } = await import('@src/mail/mail.module.js');
  const { Mailer } = await import('@src/mail/domain/mailer.js');
  return (await Test.createTestingModule({ imports: [MailModule] }).compile()).get(Mailer).constructor.name;
};

describe('MailModule', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('keeps the emails in Mailpit when MAILPIT_URL is set (dev)', async () => {
    expect(await mailerWith('http://mailpit:8025')).toBe('MailpitMailer');
  });

  it('sends through Brevo otherwise', async () => {
    expect(await mailerWith('')).toBe('BrevoMailer');
  });
});
