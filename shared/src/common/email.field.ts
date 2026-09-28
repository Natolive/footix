import { z } from 'zod'

export const emailField = z
  .email('Saisis une adresse email valide, par exemple prenom.nom@solem.fr.')
  .toLowerCase()
