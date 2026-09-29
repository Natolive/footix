import { z } from 'zod'
import { ROLES } from '../roles/permissions.ts'

export const USER_SORTS = ['name', 'email', 'emailVerified', 'role', 'extraPermissions', 'createdAt'] as const
export type UserSort = (typeof USER_SORTS)[number]

export const USER_PAGE_SIZES = [10, 25, 50, 100] as const

// Recherche, filtres, tri et page de la liste des utilisateurs (`GET /users?…`), tout en query string.
export const findUsersQuerySchema = z.object({
  q: z.string().trim().max(200, 'Raccourcis la recherche à 200 caractères.').default(''),
  // `?roles=admin` donne une chaîne, `?roles=admin&roles=user` un tableau.
  roles: z.preprocess((v) => (v === undefined ? [] : [v].flat()), z.array(z.enum(ROLES, 'Choisis uniquement des rôles existants.'))),
  emailVerified: z.enum(['all', 'verified', 'pending'], 'Choisis tous, confirmé ou en attente.').default('all'),
  extraPermissions: z.enum(['all', 'with', 'without'], 'Choisis tous, avec ou sans droits en plus.').default('all'),
  sort: z.enum(USER_SORTS, 'Trie par une colonne du tableau.').default('name'),
  desc: z.stringbool({ error: 'Indique true ou false pour l’ordre décroissant.' }).default(false),
  page: z.coerce.number('Indique un numéro de page.').int('Indique un numéro de page entier.').min(1, 'Commence à la page 1.').default(1),
  pageSize: z.coerce
    .number('Indique un nombre de lignes par page.')
    .refine((n) => (USER_PAGE_SIZES as readonly number[]).includes(n), `Choisis ${USER_PAGE_SIZES.join(', ')} lignes par page.`)
    .default(25),
})
export type FindUsersQuery = z.output<typeof findUsersQuerySchema>
