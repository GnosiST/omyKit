#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_root="${1:-$repo_root}"
codex_home="${CODEX_HOME:-$HOME/.codex}"
validator="${CODEX_SKILL_VALIDATOR:-$codex_home/skills/.system/skill-creator/scripts/quick_validate.py}"
python_bin="${PYTHON:-python3}"

if [ ! -f "$validator" ]; then
  echo "Cannot find Codex skill validator: $validator" >&2
  echo "Set CODEX_SKILL_VALIDATOR to quick_validate.py, or install the skill-creator system skill." >&2
  exit 1
fi

if ! command -v "$python_bin" >/dev/null 2>&1; then
  echo "Cannot find Python runtime: $python_bin" >&2
  echo "Set PYTHON to a Python executable with PyYAML installed." >&2
  exit 1
fi

if ! "$python_bin" -c "import yaml" >/dev/null 2>&1; then
  echo "Python runtime is missing PyYAML: $python_bin" >&2
  echo "Run with a Python that has PyYAML installed, for example:" >&2
  echo "  python3 -m venv /tmp/omykit-skill-validate" >&2
  echo "  /tmp/omykit-skill-validate/bin/python -m pip install PyYAML" >&2
  echo "  PYTHON=/tmp/omykit-skill-validate/bin/python ./scripts/validate-skills.sh" >&2
  exit 1
fi

if [ ! -d "$source_root/skills" ]; then
  echo "Cannot find skills directory: $source_root/skills" >&2
  exit 1
fi

for skill_dir in "$source_root"/skills/*; do
  [ -d "$skill_dir" ] || continue
  "$python_bin" "$validator" "$skill_dir"

  skill_file="$skill_dir/SKILL.md"
  if ! grep -q '^## Language$' "$skill_file"; then
    echo "Skill is missing a Language section: $skill_file" >&2
    exit 1
  fi
  if ! grep -q 'Match user-facing language to the latest user prompt' "$skill_file"; then
    echo "Skill is missing latest-prompt language matching rule: $skill_file" >&2
    exit 1
  fi
  if ! grep -q 'Do not expose private chain-of-thought' "$skill_file"; then
    echo "Skill is missing private chain-of-thought boundary: $skill_file" >&2
    exit 1
  fi
done

omykit_skill="$source_root/skills/omykit/SKILL.md"
router_skill="$source_root/skills/codex-project-router/SKILL.md"
change_skill="$source_root/skills/codex-change-workflow/SKILL.md"

if ! grep -q 'intake decision gate' "$omykit_skill"; then
  echo "omyKit skill is missing the intake decision gate: $omykit_skill" >&2
  exit 1
fi
if ! grep -q 'ask 1-3 concise questions' "$omykit_skill"; then
  echo "omyKit skill is missing bounded intake-question guidance: $omykit_skill" >&2
  exit 1
fi
if ! grep -q 'custom answer' "$omykit_skill"; then
  echo "omyKit skill is missing custom-answer intake guidance: $omykit_skill" >&2
  exit 1
fi
if ! grep -q 'intake question gate' "$router_skill"; then
  echo "Router skill is missing the intake question gate: $router_skill" >&2
  exit 1
fi
if ! grep -q 'Workflow shape:' "$router_skill"; then
  echo "Router skill output is missing workflow shape: $router_skill" >&2
  exit 1
fi
if ! grep -q 'Confirm the intake decision' "$change_skill"; then
  echo "Change workflow is missing intake-decision confirmation: $change_skill" >&2
  exit 1
fi

echo "All omyKit skills are valid."
