import type { EmailDomainDto } from '@footix/shared';
import type { EmailDomain } from './email-domain.entity.js';

export const toEmailDomainDto = ({ id, domain }: EmailDomain): EmailDomainDto => ({ id, domain });
