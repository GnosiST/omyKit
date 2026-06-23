#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
codex_home="${CODEX_HOME:-$HOME/.codex}"
backup_root="$codex_home/omykit/backups"

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 latest|<backup-directory-name>" >&2
  echo "Backups live under: $backup_root" >&2
  exit 1
fi

selector="$1"

if [ "$selector" = "latest" ]; then
  if [ ! -d "$backup_root" ]; then
    echo "No backup directory found: $backup_root" >&2
    exit 1
  fi
  backup_dir="$(find "$backup_root" -mindepth 1 -maxdepth 1 -type d | sort | tail -1)"
else
  backup_dir="$backup_root/$selector"
fi

if [ -z "${backup_dir:-}" ] || [ ! -d "$backup_dir" ]; then
  echo "Cannot find backup: $selector" >&2
  exit 1
fi

if [ ! -d "$backup_dir/skills" ] || [ ! -d "$backup_dir/prompts" ]; then
  echo "Backup is missing skills or prompts directories: $backup_dir" >&2
  exit 1
fi

"$repo_root/scripts/validate-skills.sh" "$backup_dir"

mkdir -p "$codex_home/skills" "$codex_home/prompts" "$codex_home/omykit/scripts" "$codex_home/omykit/schemas"

for skill_dir in "$backup_dir"/skills/*; do
  [ -d "$skill_dir" ] || continue
  skill_name="$(basename "$skill_dir")"
  tmp_skill="$codex_home/skills/.$skill_name.rollback.$$"
  rm -rf "$tmp_skill"
  cp -R "$skill_dir" "$tmp_skill"
  rm -rf "$codex_home/skills/$skill_name"
  mv "$tmp_skill" "$codex_home/skills/$skill_name"
done

if [ -f "$backup_dir/prompts/omykit.md" ]; then
  tmp_prompt="$codex_home/prompts/.omykit.md.rollback.$$"
  cp "$backup_dir/prompts/omykit.md" "$tmp_prompt"
  mv "$tmp_prompt" "$codex_home/prompts/omykit.md"
fi

if [ -f "$backup_dir/scripts/omykit-workflow.mjs" ]; then
  tmp_controller="$codex_home/omykit/scripts/.omykit-workflow.mjs.rollback.$$"
  cp "$backup_dir/scripts/omykit-workflow.mjs" "$tmp_controller"
  mv "$tmp_controller" "$codex_home/omykit/scripts/omykit-workflow.mjs"
  chmod +x "$codex_home/omykit/scripts/omykit-workflow.mjs"
fi

if [ -d "$backup_dir/schemas" ]; then
  tmp_schema_dir="$codex_home/omykit/.schemas.rollback.$$"
  rm -rf "$tmp_schema_dir"
  mkdir -p "$tmp_schema_dir"
  if find "$backup_dir/schemas" -maxdepth 1 -name '*.schema.json' -type f | grep -q .; then
    cp "$backup_dir/schemas"/*.schema.json "$tmp_schema_dir/"
    rm -rf "$codex_home/omykit/schemas"
    mv "$tmp_schema_dir" "$codex_home/omykit/schemas"
  else
    rm -rf "$tmp_schema_dir"
  fi
fi

if [ -d "$backup_dir/workflow-templates/current" ]; then
  tmp_template_dir="$codex_home/omykit/.workflow-templates.rollback.$$"
  rm -rf "$tmp_template_dir"
  cp -R "$backup_dir/workflow-templates/current" "$tmp_template_dir"
  rm -rf "$codex_home/omykit/workflow-templates"
  mv "$tmp_template_dir" "$codex_home/omykit/workflow-templates"
elif [ -d "$backup_dir/workflow-templates" ]; then
  rm -rf "$codex_home/omykit/workflow-templates"
fi

restored_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
{
  echo "restored_at=$restored_at"
  echo "restored_from=$backup_dir"
  if [ -f "$backup_dir/manifest" ]; then
    cat "$backup_dir/manifest"
  fi
} > "$codex_home/omykit/install-manifest"

echo "Restored omyKit global install from $backup_dir"
echo "Manifest: $codex_home/omykit/install-manifest"
