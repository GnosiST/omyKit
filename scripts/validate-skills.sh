#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
codex_home="${CODEX_HOME:-$HOME/.codex}"
validator="${CODEX_SKILL_VALIDATOR:-$codex_home/skills/.system/skill-creator/scripts/quick_validate.py}"
python_bin="${PYTHON:-python3}"

if [ ! -f "$validator" ]; then
  echo "Cannot find Codex skill validator: $validator" >&2
  echo "Set CODEX_SKILL_VALIDATOR to quick_validate.py, or install the skill-creator system skill." >&2
  exit 1
fi

for skill_dir in "$repo_root"/skills/*; do
  [ -d "$skill_dir" ] || continue
  "$python_bin" "$validator" "$skill_dir"
done

echo "All omyKit skills are valid."
