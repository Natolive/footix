import type { ParticipantDto } from './participant.dto.ts'

// Personne sans compte ramenée par un inscrit : elle prend une place.
export interface GuestDto {
  id: string
  name: string
  invitedBy: ParticipantDto
}
