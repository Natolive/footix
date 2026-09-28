import { z } from 'zod'

// Champ facultatif : vide, absent ou null devient null en base.
const optional = <T extends z.ZodType<string>>(schema: T) =>
  z.union([z.literal(''), schema]).nullish().transform((v) => v || null)

export const eventSchema = z.object({
  title: z.string('Donne un titre au créneau.').trim().min(1, 'Donne un titre au créneau, par exemple « Foot du jeudi ».').max(100, 'Raccourcis le titre à 100 caractères.'),
  location: z.string('Indique le lieu.').trim().min(1, 'Indique le lieu, par exemple « Urban Soccer Lyon ».').max(200, 'Raccourcis le lieu à 200 caractères.'),
  // Date envoyée en ISO par le front (le champ datetime-local est converti dans le fuseau du navigateur).
  startsAt: z.coerce.date('Choisis la date et l’heure du match.').refine((d) => d > new Date(), 'Choisis une date à venir.'),
  durationMinutes: z.coerce
    .number('Indique la durée du match.')
    .int('Indique une durée en minutes entières.')
    .min(15, 'Prévois au moins 15 minutes.')
    .max(480, 'Limite la durée à 8 h (480 minutes).'),
  maxParticipants: z.coerce
    .number('Indique le nombre de places.')
    .int('Indique un nombre de places entier.')
    .min(2, 'Prévois au moins 2 places.')
    .max(100, 'Limite à 100 places.'),
  // http(s) uniquement : le lien est affiché tel quel, pas de `javascript:`.
  paymentUrl: optional(z.url({ protocol: /^https?$/, error: 'Colle un lien complet qui commence par https://.' })),
  description: optional(z.string().trim().max(1000, 'Raccourcis la description à 1000 caractères.')),
})
export type EventInput = z.input<typeof eventSchema>
export type SaveEventDto = z.infer<typeof eventSchema>
