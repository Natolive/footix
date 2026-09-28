# Front — règles

- Composant Nuxt UI (`U*`) d'abord, icônes `i-lucide-*`.
- Composants rangés par dossier, fichier préfixé par le dossier (`form/FormBuilder.vue`).
- Template de page à racine unique, sans commentaire HTML à côté (sinon la transition de page casse).
- Formulaire = `FormBuilder` + schéma `@footix/shared`, jamais de `validate` à la main.
- Couleurs via les tokens de `main.css` et les couleurs sémantiques Nuxt UI, jamais d'hexadécimal en composant.
- Titres en `font-display` (Unbounded) en minuscules et `tracking-tight`, texte en Geist ; vert `primary` sur blanc, ballon `ball` décoratif seulement.
- Thème clair uniquement (vert et blanc, pas de mode sombre), responsive dès 360 px.
- Animation uniquement en réponse à une action (seule exception : le ballon qui tombe sur le terrain de la page de connexion), désactivée sous `prefers-reduced-motion`.
- Action qui retire ou libère quelque chose (suppression, désinscription) = `UModal` de confirmation qui dit ce qui part ; action sans effet (réponse déjà donnée) = rien, ni requête ni toast.
- Textes en français, tutoiement, bouton = verbe d'action repris dans le toast.
- SPA (`ssr: false`) : pas de code qui suppose un rendu serveur.
- Appels API via `useApi()` (cookie de session inclus), erreur affichée avec `apiErrorMessage(e)` dans un toast.
- Utilisateur connecté via `useAuth()` (`user`, `login`, `logout`, `verifyEmail`, `forgotPassword`, `resetPassword`, `updateProfile`, `updateAvailability`, `changePassword`), jamais d'appel direct à `/auth/*`.
- Pages privées par défaut (middleware `auth.global.ts`) ; `definePageMeta({ guest: true })` pour les pages visiteurs.
- Visite guidée : étapes dans `useOnboardingTour`, élément ciblé par un attribut `data-tour="<nom>"` (jamais une classe CSS).
- Page réservée : `definePageMeta({ permission: '<droit>' })` ; action masquée si `!user.permissions.includes('<droit>')`.
- Liste administrable = `UTable` alimenté par un `computed` qui filtre, trie (`manualSorting`, état via `v-model:sorting`) puis découpe la page pour `UPagination` ; recherche multi-mots sans accents ni ponctuation (voir `settings/users.vue`) ; les pages `/settings` sont en pleine largeur (layout `default.vue`) ; sur petit écran, colonne secondaire masquée via `meta.class` (`hidden md:table-cell`, classe Tailwind écrite en entier, jamais interpolée).
