// `email` : adresse du body (compte visé, boîte qui reçoit les mails) ; `ip` : appelant.
export interface RateLimitRule {
  by: 'email' | 'ip';
  limit: number;
  windowMs: number;
}
