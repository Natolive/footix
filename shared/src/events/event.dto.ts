import type { GuestDto } from './guest.dto.ts'
import type { ParticipantDto } from './participant.dto.ts'

// Créneau tel que renvoyé par l'API, avec les réponses au sondage (visibles par tous).
export interface EventDto {
  id: string
  title: string
  description: string | null
  location: string
  startsAt: string
  durationMinutes: number
  maxParticipants: number
  paymentUrl: string | null
  // Ceux qui viennent, seuls à prendre une place.
  participants: ParticipantDto[]
  // Ceux qui ont répondu « je ne viens pas ».
  declined: ParticipantDto[]
  guests: GuestDto[]
}
