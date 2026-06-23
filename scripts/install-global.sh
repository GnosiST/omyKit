#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_root="${OMYKIT_SOURCE_ROOT:-$repo_root}"
source_ref="${OMYKIT_SOURCE_REF:-working-tree}"
codex_home="${CODEX_HOME:-$HOME/.codex}"
version_file="$source_root/VERSION"
version="unknown"

if [ -f "$version_file" ]; then
  version="$(tr -d '[:space:]' < "$version_file")"
fi

if [ ! -d "$source_root/skills" ]; then
  echo "Cannot find source skills directory: $source_root/skills" >&2
  exit 1
fi

if [ ! -f "$source_root/prompts/omykit.md" ]; then
  echo "Cannot find source prompt: $source_root/prompts/omykit.md" >&2
  exit 1
fi

if [ ! -f "$source_root/scripts/omykit-workflow.mjs" ]; then
  echo "Cannot find workflow controller: $source_root/scripts/omykit-workflow.mjs" >&2
  exit 1
fi

if [ ! -d "$source_root/schemas" ]; then
  echo "Cannot find schemas directory: $source_root/schemas" >&2
  exit 1
fi

if [ ! -d "$source_root/workflow-templates" ]; then
  echo "Cannot find workflow templates directory: $source_root/workflow-templates" >&2
  exit 1
fi

assert_no_symlinks() {
  local target="$1"
  if [ -L "$target" ]; then
    echo "Installed omyKit target must be a real file or directory, not a symlink: $target" >&2
    exit 1
  fi
  if [ -d "$target" ]; then
    local first_link
    first_link="$(find "$target" -type l -print -quit)"
    if [ -n "$first_link" ]; then
      echo "Installed omyKit target contains a symlink: $first_link" >&2
      exit 1
    fi
  fi
}

"$repo_root/scripts/validate-skills.sh" "$source_root"
node "$source_root/scripts/omykit-workflow.mjs" templates validate >/dev/null

installed_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
install_stamp="$(date -u +%Y%m%dT%H%M%SZ)"
git_commit="unknown"
git_dirty="unknown"

if git -C "$source_root" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git_commit="$(git -C "$source_root" rev-parse HEAD)"
  if git -C "$source_root" diff --quiet --ignore-submodules -- && git -C "$source_root" diff --cached --quiet --ignore-submodules --; then
    git_dirty="false"
  else
    git_dirty="true"
  fi
elif [ "$source_ref" != "working-tree" ] && git -C "$repo_root" rev-parse --verify "$source_ref^{commit}" >/dev/null 2>&1; then
  git_commit="$(git -C "$repo_root" rev-parse "$source_ref^{commit}")"
  git_dirty="false"
fi

short_commit="$git_commit"
if [ "$git_commit" != "unknown" ]; then
  short_commit="${git_commit:0:12}"
fi
install_id="$install_stamp-v$version-$short_commit"
backup_candidate="$codex_home/omykit/backups/$install_id"
backup_dir="none"
backup_any="false"

mkdir -p "$codex_home/skills" "$codex_home/prompts" "$codex_home/omykit/backups"
mkdir -p "$codex_home/omykit/scripts" "$codex_home/omykit/schemas"
mkdir -p "$backup_candidate/skills" "$backup_candidate/prompts" "$backup_candidate/scripts" "$backup_candidate/schemas" "$backup_candidate/workflow-templates"

for skill_dir in "$source_root"/skills/*; do
  [ -d "$skill_dir" ] || continue
  skill_name="$(basename "$skill_dir")"
  target_skill="$codex_home/skills/$skill_name"
  if [ -e "$target_skill" ]; then
    cp -R "$target_skill" "$backup_candidate/skills/$skill_name"
    backup_any="true"
  fi
done

target_prompt="$codex_home/prompts/omykit.md"
if [ -e "$target_prompt" ]; then
  cp "$target_prompt" "$backup_candidate/prompts/omykit.md"
  backup_any="true"
fi

target_controller="$codex_home/omykit/scripts/omykit-workflow.mjs"
if [ -e "$target_controller" ]; then
  cp "$target_controller" "$backup_candidate/scripts/omykit-workflow.mjs"
  backup_any="true"
fi

if find "$codex_home/omykit/schemas" -maxdepth 1 -name '*.schema.json' -type f | grep -q .; then
  cp "$codex_home/omykit/schemas"/*.schema.json "$backup_candidate/schemas/"
  backup_any="true"
fi

if [ -d "$codex_home/omykit/workflow-templates" ]; then
  cp -R "$codex_home/omykit/workflow-templates" "$backup_candidate/workflow-templates/current"
  backup_any="true"
fi

if [ -f "$codex_home/omykit/install-manifest" ]; then
  cp "$codex_home/omykit/install-manifest" "$backup_candidate/install-manifest.previous"
fi

if [ "$backup_any" = "true" ]; then
  backup_dir="$backup_candidate"
  {
    echo "created_at=$installed_at"
    echo "version=$version"
    echo "source_ref=$source_ref"
    echo "git_commit=$git_commit"
    echo "git_dirty=$git_dirty"
  } > "$backup_candidate/manifest"
else
  rm -rf "$backup_candidate"
fi

for skill_dir in "$source_root"/skills/*; do
  [ -d "$skill_dir" ] || continue
  skill_name="$(basename "$skill_dir")"
  target_skill="$codex_home/skills/$skill_name"
  tmp_skill="$codex_home/skills/.$skill_name.tmp.$$"
  backup_skill="$codex_home/skills/.$skill_name.backup.$$"
  rm -rf "$tmp_skill"
  rm -rf "$backup_skill"
  cp -R "$skill_dir" "$tmp_skill"
  if [ -e "$target_skill" ]; then
    mv "$target_skill" "$backup_skill"
  fi
  if mv "$tmp_skill" "$target_skill"; then
    assert_no_symlinks "$target_skill"
    rm -rf "$backup_skill"
  else
    if [ -e "$backup_skill" ]; then
      mv "$backup_skill" "$target_skill"
    fi
    exit 1
  fi
done

tmp_prompt="$codex_home/prompts/.omykit.md.tmp.$$"
backup_prompt="$codex_home/prompts/.omykit.md.backup.$$"
rm -f "$backup_prompt"
cp "$source_root/prompts/omykit.md" "$tmp_prompt"
if [ -e "$target_prompt" ]; then
  mv "$target_prompt" "$backup_prompt"
fi
if mv "$tmp_prompt" "$target_prompt"; then
  assert_no_symlinks "$target_prompt"
  rm -f "$backup_prompt"
else
  if [ -e "$backup_prompt" ]; then
    mv "$backup_prompt" "$target_prompt"
  fi
  exit 1
fi

tmp_controller="$codex_home/omykit/scripts/.omykit-workflow.mjs.tmp.$$"
backup_controller="$codex_home/omykit/scripts/.omykit-workflow.mjs.backup.$$"
rm -f "$backup_controller"
cp "$source_root/scripts/omykit-workflow.mjs" "$tmp_controller"
if [ -e "$target_controller" ]; then
  mv "$target_controller" "$backup_controller"
fi
if mv "$tmp_controller" "$target_controller"; then
  chmod +x "$target_controller"
  assert_no_symlinks "$target_controller"
  rm -f "$backup_controller"
else
  if [ -e "$backup_controller" ]; then
    mv "$backup_controller" "$target_controller"
  fi
  exit 1
fi

tmp_schema_dir="$codex_home/omykit/.schemas.tmp.$$"
backup_schema_dir="$codex_home/omykit/.schemas.backup.$$"
rm -rf "$tmp_schema_dir" "$backup_schema_dir"
mkdir -p "$tmp_schema_dir"
cp "$source_root/schemas"/*.schema.json "$tmp_schema_dir/"
if [ -d "$codex_home/omykit/schemas" ]; then
  mv "$codex_home/omykit/schemas" "$backup_schema_dir"
fi
if mv "$tmp_schema_dir" "$codex_home/omykit/schemas"; then
  assert_no_symlinks "$codex_home/omykit/schemas"
  rm -rf "$backup_schema_dir"
else
  if [ -d "$backup_schema_dir" ]; then
    mv "$backup_schema_dir" "$codex_home/omykit/schemas"
  fi
  exit 1
fi

tmp_template_dir="$codex_home/omykit/.workflow-templates.tmp.$$"
backup_template_dir="$codex_home/omykit/.workflow-templates.backup.$$"
rm -rf "$tmp_template_dir" "$backup_template_dir"
cp -R "$source_root/workflow-templates" "$tmp_template_dir"
if [ -d "$codex_home/omykit/workflow-templates" ]; then
  mv "$codex_home/omykit/workflow-templates" "$backup_template_dir"
fi
if mv "$tmp_template_dir" "$codex_home/omykit/workflow-templates"; then
  assert_no_symlinks "$codex_home/omykit/workflow-templates"
  rm -rf "$backup_template_dir"
else
  if [ -d "$backup_template_dir" ]; then
    mv "$backup_template_dir" "$codex_home/omykit/workflow-templates"
  fi
  exit 1
fi

{
  echo "version=$version"
  echo "installed_at=$installed_at"
  echo "source_root=$source_root"
  echo "source_ref=$source_ref"
  echo "git_commit=$git_commit"
  echo "git_dirty=$git_dirty"
  echo "backup_dir=$backup_dir"
  echo "workflow_templates=$codex_home/omykit/workflow-templates"
} > "$codex_home/omykit/install-manifest"

echo "Installed omyKit $version into $codex_home"
echo "Manifest: $codex_home/omykit/install-manifest"
echo "Backup: $backup_dir"
if [ "$git_dirty" = "true" ]; then
  echo "Warning: installed from a dirty working tree; rerun after committing if this install is for release or handoff." >&2
fi
