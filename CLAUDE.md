# Footix — règles projet

- Appli interne : s'inscrire aux créneaux de foot de l'entreprise, rien de plus sans demande.
- Tout passe par Docker (`docker compose exec <backend|frontend> ...`), jamais `npm` sur l'hôte (Node trop ancien).
- Nouvelle dépendance : `docker compose exec <service> npm install <paquet>` puis `docker compose up -d --build -V`.
- Workspace npm : `shared/` (DTO Zod), `backend/` (Nest, voir `backend/CLAUDE.md`), `frontend/` (Nuxt, voir `frontend/CLAUDE.md`), un seul lockfile à la racine.
- Organiser par domaine en dossiers, jamais tout dans un fichier : un fichier par service, DTO, type, erreur ou décorateur exporté.
- Un DTO = `shared/src/<domaine>/<nom>.dto.ts` (un schéma + ses types inférés, ou une interface), réexporté dans `shared/src/index.ts`.
- Dans `shared/` : imports relatifs en `.ts`, pas d'`enum`/`namespace` (chargé sans compilation).
- La validation vit uniquement dans le schéma partagé, messages en français qui disent comment corriger.
- Code en anglais, commentaires et textes d'interface en français.
- Pas d'abstraction « pour plus tard » ; raccourci assumé = commentaire `ponytail:`.

## Rôles et droits

- Tout vit dans `shared/src/roles/permissions.ts` : `PERMISSIONS`, libellés, catégories, `ROLES`, `DEFAULT_ROLE_PERMISSIONS`.
- Un droit par action, nommé `<catégorie>.<action>` (`users.read`, `users.update_role`) ; jamais de droit fourre-tout type `manage`.
- Nouvelle action protégée = nouveau droit dans `PERMISSIONS` + `PERMISSION_LABELS` ; nouvelle catégorie = libellé dans `PERMISSION_CATEGORY_LABELS`.
- Droits effectifs = droits du rôle + `users.extra_permissions` de la personne, renvoyés dans `UserDto.permissions`.
- Rôles : `user` (donné à l'inscription), `admin` (en plus : les droits `planning` listés dans `DEFAULT_ROLE_PERMISSIONS.admin`, pas `planning.delete_event` : il annule, seul le super admin supprime ; nouveau droit `planning` = l'ajouter à cette liste si l'admin doit l'avoir) et `super_admin` (a toujours tout, non modifiable).
- Par défaut `user` a tout sauf les catégories d'administration (`ADMIN_CATEGORIES` : `roles`, `users`, `planning`, `email_domains`) ; une catégorie d'admin nouvelle va dans cette liste.
- `role_permissions` ne stocke que ce qu'un admin a modifié ; sans ligne, le défaut du code s'applique (nouveau droit = pas de migration).
- Droit supprimé ou renommé = migration qui nettoie `role_permissions` et `users.extra_permissions`.
- Règles vérifiées côté API et reprises à l'écran : seul un super admin touche à un super admin ; personne ne modifie son propre rôle ni ses droits, ni ne supprime son propre compte.
- Premier super admin : `UPDATE users SET role = 'super_admin' WHERE email = '…'` (pas d'écran).

## Avant de dire « fini » ou de commit

- `README.md` à jour dès qu'un comportement visible change : règle métier → section du domaine (Créneaux, Comptes…), CI ou serveur → Production.
- Nouvelle règle de code ou nouvelle convention → le `CLAUDE.md` concerné (racine, `backend/`, `frontend/`).
- Règle métier back = test unitaire du service ; `docker compose exec backend npm run test:cov` vert (tests + couverture 100 %) avant de commit.
- Commit en français, une ligne qui dit ce qui change pour l'utilisateur.
- Push sur `main` = déploiement en prod : seulement sur demande ; `[skip ci]` dans le message si seuls docs ou commentaires changent.
