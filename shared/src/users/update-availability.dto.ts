import { z } from 'zod'
import { WEEKDAYS } from './weekday.ts'

// Jours où la personne peut jouer, en général : les organisateurs s'en servent pour choisir les créneaux.
// Rangés dans l'ordre de la semaine, sans doublon.
export const updateAvailabilitySchema = z.object({
  availableDays: z
    .array(z.enum(WEEKDAYS, 'Coche uniquement des jours de la semaine.'))
    .transform((days) => WEEKDAYS.filter((d) => days.includes(d))),
})
export type UpdateAvailabilityDto = z.infer<typeof updateAvailabilitySchema>
