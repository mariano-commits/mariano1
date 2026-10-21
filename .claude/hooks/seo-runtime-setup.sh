#!/usr/bin/env bash
# Instala el runtime Python + Chromium de claude-seo si falta (sesiones nuevas / cloud).
set -uo pipefail
launcher="${CLAUDE_PROJECT_DIR:-.}/.claude/skills/seo/bin/claude-seo"
[ -x "$launcher" ] || exit 0
if "$launcher" doctor 2>/dev/null | grep -q '^Runtime: ready'; then exit 0; fi
"$launcher" setup >&2 || echo "claude-seo setup incompleto; ejecutar: $launcher setup" >&2
exit 0
