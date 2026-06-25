#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_root="${OMYKIT_SOURCE_ROOT:-$repo_root}"
version_file="$source_root/VERSION"
version="unknown"

if [ -f "$version_file" ]; then
  version="$(tr -d '[:space:]' < "$version_file")"
fi

usage() {
  cat <<'USAGE'
Usage:
  scripts/project-local.sh enable [target-project]
  scripts/project-local.sh disable [target-project]
  scripts/project-local.sh status [target-project]
  scripts/project-local.sh uninstall [target-project]

Project-local mode copies omyKit entry points into the target project:
  .codex/skills/*
  .codex/prompts/omykit.md
  .omykit/kit/*

The script keeps these paths local-only in Git projects by writing exact
entries to .git/info/exclude. It does not commit, push, or rewrite history.
USAGE
}

die() {
  echo "$1" >&2
  exit 1
}

command="${1:-}"
case "$command" in
  enable|disable|status|uninstall)
    shift
    ;;
  -h|--help|help)
    usage
    exit 0
    ;;
  "")
    command="status"
    ;;
  *)
    die "Unknown command: $command"
    ;;
esac

target_root="${1:-$PWD}"
target_root="$(cd "$target_root" 2>/dev/null && pwd || true)"
[ -n "$target_root" ] || die "Target project does not exist."
[ -d "$target_root" ] || die "Target project is not a directory: $target_root"

codex_dir="$target_root/.codex"
skills_dir="$codex_dir/skills"
prompts_dir="$codex_dir/prompts"
prompt_path="$prompts_dir/omykit.md"
omykit_root="$target_root/.omykit"
kit_dir="$omykit_root/kit"
manifest_path="$kit_dir/install-manifest"

require_source() {
  [ -d "$source_root/skills" ] || die "Cannot find source skills directory: $source_root/skills"
  [ -f "$source_root/prompts/omykit.md" ] || die "Cannot find source prompt: $source_root/prompts/omykit.md"
  [ -f "$source_root/scripts/omykit-workflow.mjs" ] || die "Cannot find workflow controller: $source_root/scripts/omykit-workflow.mjs"
  [ -d "$source_root/schemas" ] || die "Cannot find schemas directory: $source_root/schemas"
  [ -d "$source_root/workflow-templates" ] || die "Cannot find workflow templates directory: $source_root/workflow-templates"
}

assert_namespace_available() {
  if [ -e "$omykit_root" ] && [ ! -d "$omykit_root" ]; then
    die "Cannot enable omyKit: .omykit exists but is not a directory in $target_root"
  fi
}

skill_names() {
  for skill_dir in "$source_root"/skills/*; do
    [ -d "$skill_dir" ] || continue
    basename "$skill_dir"
  done | sort
}

git_exclude_file() {
  local file
  file="$(git -C "$target_root" rev-parse --git-path info/exclude 2>/dev/null || true)"
  [ -n "$file" ] || return 0
  case "$file" in
    /*) printf '%s\n' "$file" ;;
    *) printf '%s\n' "$target_root/$file" ;;
  esac
}

ensure_local_exclude_entry() {
  local entry="$1"
  local file="$2"
  [ -n "$file" ] || return 0
  mkdir -p "$(dirname "$file")"
  touch "$file"
  if ! awk -v entry="$entry" '$0 == entry { found = 1 } END { exit(found ? 0 : 1) }' "$file"; then
    printf '%s\n' "$entry" >> "$file"
  fi
}

ensure_project_local_excludes() {
  local file
  file="$(git_exclude_file)"
  [ -n "$file" ] || return 0
  ensure_local_exclude_entry "# omyKit project-local runtime and Codex entry points (do not commit)" "$file"
  ensure_local_exclude_entry ".omykit/" "$file"
  ensure_local_exclude_entry ".codex/prompts/omykit.md" "$file"
  while IFS= read -r skill_name; do
    ensure_local_exclude_entry ".codex/skills/$skill_name/" "$file"
  done < <(skill_names)
}

copy_dir_atomic() {
  local source="$1"
  local target="$2"
  local tmp="$target.tmp.$$"
  local backup="$target.backup.$$"
  rm -rf "$tmp" "$backup"
  cp -R "$source" "$tmp"
  if [ -e "$target" ]; then
    mv "$target" "$backup"
  fi
  if mv "$tmp" "$target"; then
    rm -rf "$backup"
  else
    if [ -e "$backup" ]; then
      mv "$backup" "$target"
    fi
    exit 1
  fi
}

copy_file_atomic() {
  local source="$1"
  local target="$2"
  local tmp="$target.tmp.$$"
  local backup="$target.backup.$$"
  rm -f "$tmp" "$backup"
  cp "$source" "$tmp"
  if [ -e "$target" ]; then
    mv "$target" "$backup"
  fi
  if mv "$tmp" "$target"; then
    rm -f "$backup"
  else
    if [ -e "$backup" ]; then
      mv "$backup" "$target"
    fi
    exit 1
  fi
}

write_manifest() {
  local enabled="$1"
  local backup_dir="$2"
  local installed_at="$3"
  local git_commit="unknown"
  local git_dirty="unknown"

  if git -C "$source_root" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git_commit="$(git -C "$source_root" rev-parse HEAD)"
    if git -C "$source_root" diff --quiet --ignore-submodules -- && git -C "$source_root" diff --cached --quiet --ignore-submodules --; then
      git_dirty="false"
    else
      git_dirty="true"
    fi
  fi

  mkdir -p "$kit_dir"
  {
    echo "scope=project"
    echo "enabled=$enabled"
    echo "version=$version"
    echo "installed_at=$installed_at"
    echo "target_root=$target_root"
    echo "source_root=$source_root"
    echo "source_ref=working-tree"
    echo "git_commit=$git_commit"
    echo "git_dirty=$git_dirty"
    echo "backup_dir=$backup_dir"
    echo "skills_dir=.codex/skills"
    echo "prompt=.codex/prompts/omykit.md"
    echo "controller=.omykit/kit/scripts/omykit-workflow.mjs"
    echo "schemas=.omykit/kit/schemas"
    echo "workflow_templates=.omykit/kit/workflow-templates"
  } > "$manifest_path"
}

enable_project() {
  require_source
  assert_namespace_available
  "$repo_root/scripts/validate-skills.sh" "$source_root"
  node "$source_root/scripts/omykit-workflow.mjs" templates validate >/dev/null

  local installed_at install_stamp git_commit short_commit backup_dir backup_any
  installed_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  install_stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  git_commit="unknown"
  if git -C "$source_root" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git_commit="$(git -C "$source_root" rev-parse HEAD)"
  fi
  short_commit="$git_commit"
  if [ "$git_commit" != "unknown" ]; then
    short_commit="${git_commit:0:12}"
  fi
  backup_dir="$kit_dir/backups/$install_stamp-v$version-$short_commit"
  backup_any="false"

  mkdir -p "$skills_dir" "$prompts_dir" "$kit_dir/backups"
  mkdir -p "$backup_dir/skills" "$backup_dir/prompts" "$backup_dir/kit"

  while IFS= read -r skill_name; do
    if [ -e "$skills_dir/$skill_name" ]; then
      cp -R "$skills_dir/$skill_name" "$backup_dir/skills/$skill_name"
      backup_any="true"
    fi
  done < <(skill_names)
  if [ -e "$prompt_path" ]; then
    cp "$prompt_path" "$backup_dir/prompts/omykit.md"
    backup_any="true"
  fi
  for existing in scripts schemas workflow-templates install-manifest disabled; do
    if [ -e "$kit_dir/$existing" ]; then
      cp -R "$kit_dir/$existing" "$backup_dir/kit/$existing"
      backup_any="true"
    fi
  done
  if [ "$backup_any" != "true" ]; then
    rm -rf "$backup_dir"
    backup_dir="none"
  fi

  while IFS= read -r skill_name; do
    copy_dir_atomic "$source_root/skills/$skill_name" "$skills_dir/$skill_name"
  done < <(skill_names)
  copy_file_atomic "$source_root/prompts/omykit.md" "$prompt_path"

  mkdir -p "$kit_dir/scripts"
  copy_file_atomic "$source_root/scripts/omykit-workflow.mjs" "$kit_dir/scripts/omykit-workflow.mjs"
  chmod +x "$kit_dir/scripts/omykit-workflow.mjs"
  copy_dir_atomic "$source_root/schemas" "$kit_dir/schemas"
  copy_dir_atomic "$source_root/workflow-templates" "$kit_dir/workflow-templates"
  ensure_project_local_excludes
  write_manifest "true" "$backup_dir" "$installed_at"

  echo "Enabled project-local omyKit $version in $target_root"
  echo "Manifest: $manifest_path"
  echo "Backup: $backup_dir"
}

disable_project() {
  assert_namespace_available
  local disabled_at stamp disabled_dir moved
  disabled_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  disabled_dir="$kit_dir/disabled/$stamp"
  moved="false"
  ensure_project_local_excludes
  mkdir -p "$disabled_dir/skills" "$disabled_dir/prompts"

  while IFS= read -r skill_name; do
    if [ -e "$skills_dir/$skill_name" ]; then
      mv "$skills_dir/$skill_name" "$disabled_dir/skills/$skill_name"
      moved="true"
    fi
  done < <(skill_names)
  if [ -e "$prompt_path" ]; then
    mv "$prompt_path" "$disabled_dir/prompts/omykit.md"
    moved="true"
  fi
  write_manifest "false" "$disabled_dir" "$disabled_at"

  echo "Disabled project-local omyKit in $target_root"
  echo "Manifest: $manifest_path"
  echo "Disabled entry backup: $disabled_dir"
  if [ "$moved" != "true" ]; then
    echo "No active project-local omyKit entry points were present."
  fi
}

status_project() {
  local total present prompt_status controller_status enabled manifest_enabled exclude_status
  total="0"
  present="0"
  while IFS= read -r skill_name; do
    total=$((total + 1))
    if [ -d "$skills_dir/$skill_name" ]; then
      present=$((present + 1))
    fi
  done < <(skill_names)
  prompt_status="missing"
  [ -f "$prompt_path" ] && prompt_status="present"
  controller_status="missing"
  [ -f "$kit_dir/scripts/omykit-workflow.mjs" ] && controller_status="present"
  manifest_enabled="unknown"
  if [ -f "$manifest_path" ]; then
    manifest_enabled="$(awk -F= '$1 == "enabled" { print $2 }' "$manifest_path" | tail -1)"
    [ -n "$manifest_enabled" ] || manifest_enabled="unknown"
  fi
  enabled="false"
  if [ "$present" = "$total" ] && [ "$prompt_status" = "present" ] && [ "$controller_status" = "present" ] && [ "$manifest_enabled" != "false" ]; then
    enabled="true"
  fi
  exclude_status="not_git_repo"
  local exclude_file
  exclude_file="$(git_exclude_file)"
  if [ -n "$exclude_file" ]; then
    exclude_status="missing"
    if [ -f "$exclude_file" ] && awk '$0 == ".omykit/" { found = 1 } END { exit(found ? 0 : 1) }' "$exclude_file"; then
      exclude_status="active"
    fi
  fi

  cat <<STATUS
omyKit project-local status
target: $target_root
enabled: $enabled
manifest_enabled: $manifest_enabled
skills: $present/$total
prompt: $prompt_status
controller: $controller_status
manifest: $([ -f "$manifest_path" ] && echo present || echo missing)
local_git_exclude: $exclude_status
STATUS
}

uninstall_project() {
  assert_namespace_available
  local stamp archive_base archive_dir
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  disable_project >/dev/null || true
  if git -C "$target_root" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    archive_base="$(git -C "$target_root" rev-parse --git-path omykit-uninstalled)"
    case "$archive_base" in
      /*) ;;
      *) archive_base="$target_root/$archive_base" ;;
    esac
  else
    archive_base="$target_root/.omykit-uninstalled"
  fi
  archive_dir="$archive_base/$stamp"
  mkdir -p "$archive_base"
  if [ -d "$omykit_root" ]; then
    mv "$omykit_root" "$archive_dir"
  else
    mkdir -p "$archive_dir"
  fi
  rmdir "$prompts_dir" "$skills_dir" "$codex_dir" 2>/dev/null || true
  echo "Uninstalled project-local omyKit from $target_root"
  echo "Archive: $archive_dir"
}

case "$command" in
  enable)
    enable_project
    ;;
  disable)
    disable_project
    ;;
  status)
    status_project
    ;;
  uninstall)
    uninstall_project
    ;;
esac
