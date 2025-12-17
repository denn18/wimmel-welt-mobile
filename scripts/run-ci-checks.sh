#!/usr/bin/env bash
set -euo pipefail

# Simple helper to run the same checks as the CI workflow locally.
# It lints the Expo app and the bundled backend snapshot using the
# correct working directories for this repository layout.

export NPM_CONFIG_PROGRESS=false
export NPM_CONFIG_FUND=false

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

pushd "$ROOT_DIR/app" >/dev/null
npm ci
npm run lint
popd >/dev/null

pushd "$ROOT_DIR/docs/backend-snapshot" >/dev/null
# Backend linting may rely on environment variables; fall back to
# sensible defaults when they are not provided locally.
export FILE_STORAGE_MODE="${FILE_STORAGE_MODE:-local}"
export PORT="${PORT:-2000}"

npm ci
npm run lint
popd >/dev/null
