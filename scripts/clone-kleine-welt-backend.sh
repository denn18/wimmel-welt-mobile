#!/usr/bin/env bash
set -euo pipefail

# Clone the backend from the "kleine Welt" repo without altering the source repository.
# Usage:
#   scripts/clone-kleine-welt-backend.sh <kleine-welt-repo-url> [<backend-path-in-source>] [<target-dir>]
#
# Arguments:
#   <kleine-welt-repo-url>    Required. HTTPS/SSH URL of the source repo.
#   <backend-path-in-source>  Optional. Path inside the source repo that contains the backend (default: backend).
#   <target-dir>              Optional. Destination directory in this repo (default: backend).

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <kleine-welt-repo-url> [<backend-path-in-source>] [<target-dir>]" >&2
  exit 1
fi

REPO_URL="$1"
SOURCE_PATH="${2:-backend}"
TARGET_DIR="${3:-backend}"

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

echo "Cloning $REPO_URL (shallow) ..."
git clone --depth=1 "$REPO_URL" "$WORKDIR"

if [[ ! -d "$WORKDIR/$SOURCE_PATH" ]]; then
  echo "Expected backend path '$SOURCE_PATH' not found in source repo." >&2
  exit 2
fi

echo "Copying backend from '$SOURCE_PATH' to '$TARGET_DIR' ..."
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
rsync -a --delete --exclude='.git' "$WORKDIR/$SOURCE_PATH/" "$TARGET_DIR/"

echo "Backend copied to '$TARGET_DIR'. You can now commit it to this repository."
