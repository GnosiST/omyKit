#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <git-ref>" >&2
  echo "Example: $0 main" >&2
  exit 1
fi

ref="$1"

if ! git -C "$repo_root" rev-parse --verify "$ref^{tree}" >/dev/null 2>&1; then
  echo "Cannot find git ref: $ref" >&2
  exit 1
fi

tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/omykit-ref.XXXXXX")"
trap 'rm -rf "$tmp_dir"' EXIT

git -C "$repo_root" archive "$ref" | tar -x -C "$tmp_dir"

OMYKIT_SOURCE_ROOT="$tmp_dir" OMYKIT_SOURCE_REF="$ref" "$repo_root/scripts/install-global.sh"
