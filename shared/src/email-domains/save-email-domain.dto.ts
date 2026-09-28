import { z } from 'zod'

export const emailDomainSchema = z.object({
  domain: z
    .string('Saisis un nom de domaine.')
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/, 'Saisis un nom de domaine sans @, par exemple solem.fr.'),
})
export type SaveEmailDomainDto = z.infer<typeof emailDomainSchema>
