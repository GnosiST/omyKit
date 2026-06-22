#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
codex_home="${CODEX_HOME:-$HOME/.codex}"

mkdir -p "$codex_home/skills" "$codex_home/prompts"

for skill_dir in "$repo_root"/skills/*; do
  [ -d "$skill_dir" ] || continue
  skill_name="$(basename "$skill_dir")"
  rm -rf "$codex_home/skills/$skill_name"
  cp -R "$skill_dir" "$codex_home/skills/$skill_name"
done

cp "$repo_root/prompts/omykit.md" "$codex_home/prompts/omykit.md"

echo "Installed omyKit skills and prompt into $codex_home"
