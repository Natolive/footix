# Footix

Appli pour s'inscrire aux créneaux de foot proposés par la boîte.

```bash
docker compose up --build
```

- http://footix.localhost — front Nuxt 4 (Nuxt UI)
- http://api.footix.localhost — API NestJS
- http://mail.footix.localhost — Mailpit : emails envoyés en dev (jamais vraiment envoyés)
- http://traefik.footix.localhost — dashboard Traefik
- PostgreSQL : `localhost:5432`, base/utilisateur/mot de passe `footix` (dev)

## Structure

Espace de travail npm (un seul `package-lock.json` à la racine) :

```
shared/     @footix/shared : schémas Zod + types (DTO) partagés front/back, un DTO par fichier
  src/common/   champs réutilisables (email.field.ts, new-password.field.ts)
  src/auth/     account, login, signup, verify-email, forgot-password, reset-password (.dto.ts)
  src/roles/    permissions.ts (droits, rôles, défauts), role.dto.ts, update-role.dto.ts
  src/users/    weekday.ts, user.dto.ts, update-profile, change-password, update-availability,
                day-availability, managed-user, update-user, update-user-role, update-user-permissions (.dto.ts)
  src/events/   event, participant, guest, save-event, answer-event, add-guest (.dto.ts)
  src/email-domains/ email-domain.dto.ts, save-email-domain.dto.ts
backend/    NestJS
  src/<domaine>/       auth, users, roles, events, email-domains ; architecture hexagonale :
    domain/              entités, ports (classes abstraites), mappers vers DTO, errors/ (une erreur par fichier)
    application/         un service par cas d'usage (<action>.service.ts, méthode execute), appelé par le controller
    infrastructure/      adaptateurs : Drizzle, HTTP (controllers), etc.
  src/mail/            emails : port Mailer, templates (application/templates/), adaptateurs Brevo et Mailpit
  src/common/          BaseRepository, orThrow, DrizzleRepository, DatabaseModule,
                       DomainErrorFilter (erreur métier → HTTP), ZodValidationPipe, RateLimit
  drizzle/             migrations SQL (appliquées au démarrage)
frontend/   Nuxt 4
  app/components/brand/  logo, élément graphique
  app/components/event/  EventCard (créneau, places, réponses au sondage, invités)
  app/components/form/   FormBuilder (formulaire généré depuis une liste de champs + schéma)
  app/composables/       useApi, useAuth, useOnboardingTour (visite guidée driver.js)
  app/layouts/           default (navbar), auth (bandeau de marque sur grand écran + formulaire)
  app/pages/             index (créneaux), profile (son nom, ses dispos, son mot de passe),
                         availability (dispos des joueurs par jour, pour les organisateurs),
                         login, signup, verify-email, forgot-password, reset-password,
                         settings/ : users (liste, modification, suppression), roles (droits des rôles),
                         email-domains (domaines autorisés à créer un compte)
  app/utils/             permissionGroups (droits groupés par catégorie), weekdayGroups (cases des dispos)
  app/types/
```

Ajouter un DTO : créer `shared/src/<domaine>/<nom>.dto.ts` (un DTO par fichier) et l'exporter dans `shared/src/index.ts`
(imports relatifs avec l'extension `.ts`, pas d'`enum`).

Hot reload actif. Après ajout d'une dépendance : `docker compose up --build -V`.

Éditeur (VS Code) : les dépendances ne vivent que dans Docker ; pour que l'éditeur les voie, les copier sur l'hôte
(`node_modules` ignoré par git, à refaire après chaque nouvelle dépendance) : `docker compose cp backend:/repo/node_modules .`
Tests back : `docker compose exec backend npm test` (unitaires), `docker compose exec backend npm run test:e2e` (e2e, vraie base).

## Créneaux

- Un organisateur crée un créneau : titre, date et heure, durée (minutes, 60 par défaut), lieu, nombre de places,
  lien de paiement et infos facultatifs. La carte affiche l'heure de début et de fin.
- Chacun répond au sondage « je viens » / « je ne viens pas » jusqu'au début du match ; seuls les « je viens » prennent une place.
- Qui vient peut ramener des invités sans compte (juste un nom, droit `events.invite_guest`) : chacun prend une place.
  Répondre « je ne viens pas » retire ses invités ; on retire les siens, un organisateur (`planning.update_event`)
  retire ceux de tout le monde. Plus d'ajout ni de retrait une fois le match commencé.
- Le premier « je viens » qui prend une place envoie un email de confirmation avec le match en `.ics` (fin = début + durée) :
  un seul par personne et par créneau (`event_participants.confirmation_sent_at`), même si elle change d'avis.
  Un échec d'envoi est loggé sans annuler l'inscription.
- Supprimer un créneau pas encore commencé envoie un email d'annulation à ceux qui venaient (pas aux « je ne viens pas ») ;
  un échec d'envoi est loggé, la suppression reste faite.
- Se désinscrire passe par une modal de confirmation (qui liste ses invités, libérés avec soi) ; recliquer sur
  la réponse déjà donnée ne fait rien.
- Dispos : à l'inscription puis dans son profil, chacun coche les jours de la semaine où il peut jouer (`PUT /auth/me/availability`,
  droit `profile.update_availability`, `users.available_days`). Les organisateurs voient qui est dispo chaque jour
  dans l'onglet Dispos de la barre de navigation (`/availability`, `GET /users/availability`,
  droit `planning.read_availability`), comptes confirmés seulement.
- Rôles : `user` répond aux sondages et ramène des invités, `admin` organise aussi les créneaux (catégorie de droits `planning`), `super_admin` a tout.
  Premier super admin : `UPDATE users SET role = 'super_admin' WHERE email = '…'`.

## Emails

- Envoyés par l'API transactionnelle de Brevo (`src/mail/infrastructure/brevo-mailer.ts`), sans SDK.
- Un email = un template `src/mail/application/templates/<nom>.mail.ts` qui renvoie `{ to, subject, html }`
  dans le cadre commun `layout()` ; valeurs insérées via `html\`\`` (échappées automatiquement).
  Envoi : `mailer.send(monMail(...))`, avec `MailModule` importé dans le module.
- Pièce jointe : `attachments: [{ name, contentType, content }]` (contenu en clair, encodé par l'adaptateur) ;
  fichier calendrier via `ics()` (`src/mail/application/ics.ts`).
- Dev : les emails arrivent dans Mailpit (http://mail.footix.localhost), rien ne part vraiment.
  Sans Mailpit ni `BREVO_API_KEY` (CI), l'email s'affiche dans les logs du back.

## Comptes

- Inscription en deux étapes : le compte (prénom, nom, email, mot de passe), puis ses dispos (facultatives),
  envoyés ensemble à la fin. Réservée aux domaines email autorisés, envoie un lien de confirmation (`/verify-email?token=…`,
  valable 48 h) ; connexion refusée (403) tant que l'email n'est pas confirmé.
- La page du lien redemande le mot de passe de l'inscription, puis connecte : un tiers qui s'inscrit avec l'email
  d'un collègue ne peut pas récupérer le compte, même si le collègue ouvre le lien.
- Se réinscrire avec un email pas encore confirmé remplace le compte et renvoie un lien (faute de frappe, lien perdu).
- Mot de passe oublié : lien valable 1 h (`/reset-password?token=…`) ; le nouveau mot de passe déconnecte toutes les
  sessions, connecte, et confirme l'email si ce n'était pas fait. Même réponse que le compte existe ou non.
- Mon profil (`/profile`, menu du compte) : chacun modifie son nom et son prénom, ses dispos (voir Créneaux) (`PATCH /auth/me`, droit
  `profile.update`) et change son mot de passe en redonnant l'actuel (`POST /auth/me/password`, droit
  `profile.change_password`, 10 essais / 15 min par IP) ; ses autres sessions sont déconnectées, pas celle-ci.
  L'email ne se change pas.
- La liste des utilisateurs (`/settings/users`) montre si l'email est confirmé (`ManagedUserDto.emailVerified`), le rôle,
  les droits en plus et la date d'inscription (`ManagedUserDto.createdAt`). Tout se fait dans le navigateur sur la liste
  complète (`GET /users`) :
  - recherche : chaque mot tapé doit se trouver dans le prénom, le nom, l'email, le rôle, le statut de l'email, un droit
    en plus ou la date, dans n'importe quel ordre ; accents, majuscules et ponctuation ignorés (« jean pierre » trouve
    « Jean-Pierre », « oneil » trouve « O'Neil ») ;
  - filtres : rôles (plusieurs), email confirmé ou en attente, avec ou sans droits en plus ;
  - tri par colonne (à égalité, par nom), colonnes masquables, pagination de 10 à 100 lignes avec le total.
- Supprimer un utilisateur (droit `users.delete`) efface aussi ses sessions, ses réponses et ses invités (cascade) ;
  jamais soi-même, et un super admin seulement par un super admin.
- Jetons des liens stockés hachés (SHA-256), à usage unique ; un nouveau lien remplace le précédent.
- Limites par route (`@RateLimit`, en mémoire, 429 au-delà) :

  | Route | Par email | Par IP |
  | --- | --- | --- |
  | `signup`, `forgot-password` | 3 / h | 30 / h |
  | `login` | 10 / 15 min | 50 / 15 min |
  | `verify-email`, `reset-password` | — | 20 / 15 min |
  | `me/password` | — | 10 / 15 min |

  IP lue dans `X-Forwarded-For` (`trust proxy`) : l'API ne doit jamais être exposée sans Caddy ou Traefik devant.

## Visite guidée

- À la première connexion (après la confirmation de l'email), la personne arrive sur les créneaux, où une visite
  guidée (driver.js) montre un créneau, le sondage, le lien de paiement, puis le menu du compte pour renseigner
  ses dispos dans « Mon profil ».
- Elle s'affiche une seule fois par compte : `POST /auth/me/onboarding` (droit `profile.complete_onboarding`) remplit
  `users.onboarded_at` dès l'affichage, renvoyé dans `UserDto.onboarded`.
- Le temps de la visite, un créneau d'exemple non cliquable est affiché en tête de liste, même sans vrai créneau.
- Revoir la visite : `UPDATE users SET onboarded_at = NULL WHERE email = '…'`.

## Production

URL : https://foot.benit.ooo, API sous https://foot.benit.ooo/api (relayée par le front).
HTTPS assuré par Caddy sur le serveur (`/etc/caddy/Caddyfile` : `foot.benit.ooo { reverse_proxy 127.0.0.1:3001 }`).

À chaque push sur `main`, `.github/workflows/prod.yml` lance les tests, publie l'image sur
`ghcr.io/natolive/footix` (tags `latest` et commit), copie `docker-compose.prod.yml` sur le serveur puis y fait
`docker compose pull && up -d`, puis supprime les anciennes images footix (seule celle en service reste). Le serveur ne contient que `~/footix/{docker-compose.prod.yml,.env}` : ni code, ni build.
Migrations appliquées au démarrage de l'API, base et API non exposées.

Mise en place, une fois :

1. Serveur : Docker installé, `mkdir ~/footix` et y créer `.env` depuis `.env.example`.
2. Clé SSH de la CI : `ssh-keygen -t ed25519 -f footix-ci -N ''`, ajouter `footix-ci.pub`
   à `~/.ssh/authorized_keys` du serveur.
3. GitHub → Settings → Environments → `production`, secrets :
   `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY` (contenu de `footix-ci`), `SSH_KNOWN_HOSTS` (sortie de `ssh-keyscan <hôte>`),
   `BREVO_API_KEY` (clé API v3 `xkeysib-…`) : `gh secret set BREVO_API_KEY --env production` ;
   variable `MAIL_FROM` : `gh variable set MAIL_FROM --env production --body noreply@noreply.benit.ooo`.
   Les deux sont recopiés dans le `.env` du serveur à chaque déploiement.
   Brevo : expéditeur `noreply@noreply.benit.ooo` et domaine `noreply.benit.ooo` authentifiés (DNS).
4. Premier push sur `main`, puis créer son compte et passer super admin :
   `docker compose -f docker-compose.prod.yml exec db psql -U footix -c "UPDATE users SET role = 'super_admin' WHERE email = '…'"`.

Revenir à une version (image retirée de ghcr.io, plus gardée sur le serveur) : sur le serveur, `IMAGE_TAG=<commit> docker compose -f docker-compose.prod.yml up -d`.
