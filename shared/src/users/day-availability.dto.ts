import type { Weekday } from './weekday.ts'

// Qui est dispo chaque jour, du lundi au dimanche.
export interface DayAvailabilityDto {
  day: Weekday
  people: { id: string, firstName: string, lastName: string }[]
}
