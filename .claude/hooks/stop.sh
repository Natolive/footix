#!/bin/sh
# Rappel des règles de maintenance avant de finir, seulement si les changements non commités ont bougé
# depuis le dernier rappel (une simple réponse à une question ne le redéclenche pas).
grep -q '"stop_hook_active": *true' && exit 0
cd "$CLAUDE_PROJECT_DIR" || exit 0
changes=$(git status --porcelain)
[ -z "$changes" ] && exit 0
hash=$( { echo "$changes"; git diff; } | shasum)
last=.git/claude-stop-hook
[ "$hash" = "$(cat "$last" 2>/dev/null)" ] && exit 0
echo "$hash" > "$last"
echo '{"decision":"block","reason":"Des changements ne sont pas commités : avant de dire « fini », vérifier la section « Avant de dire « fini » ou de commit » du CLAUDE.md racine (README, CLAUDE.md, tests), puis répondre."}'
