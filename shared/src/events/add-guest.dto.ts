import { z } from 'zod'

// Invité : juste un nom, il n'a pas de compte.
export const addGuestSchema = z.object({
  name: z.string('Indique le nom de ton invité.').trim().min(1, 'Indique le nom de ton invité, par exemple « Paul ».').max(60, 'Raccourcis le nom à 60 caractères.'),
})
export type AddGuestDto = z.infer<typeof addGuestSchema>
