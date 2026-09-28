import type { EmailDomain } from './email-domain.entity.js';

export type NewEmailDomain = Pick<EmailDomain, 'domain'>;
