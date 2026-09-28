import { z } from 'zod'

// Réponse au sondage de la personne connectée : elle peut changer d'avis tant que le match n'a pas commencé.
export const answerEventSchema = z.object({
  attending: z.boolean('Réponds « je viens » ou « je ne viens pas ».'),
})
export type AnswerEventDto = z.infer<typeof answerEventSchema>
