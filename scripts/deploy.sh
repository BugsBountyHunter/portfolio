#!/usr/bin/env bash
set -euo pipefail

readonly remote_host="myserver-saber"
readonly remote_source_dir="/home/saber/apps/ahmed-portfolio/source"
readonly remote_mkdir_command="mkdir -p '$remote_source_dir'"
readonly remote_deploy_command="cd '$remote_source_dir' && docker compose up -d --build --remove-orphans && docker compose ps && curl --fail --silent http://127.0.0.1/healthz"

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(cd -- "$script_dir/.." && pwd -P)"
cd "$repo_root"

local_revision="$(git rev-parse --verify HEAD)"
printf 'Preparing deployment of local revision %s from %s\n' "$local_revision" "$repo_root"

npm ci
npm run check
bash tests/container-smoke.sh

# The fixed command is deliberately expanded locally before SSH transmits it.
# shellcheck disable=SC2029
ssh "$remote_host" "$remote_mkdir_command"
rsync --archive --compress --delete \
  --exclude '.git' \
  --exclude '.superpowers' \
  --exclude '.next' \
  --exclude 'node_modules' \
  --exclude 'out' \
  --exclude 'test-results' \
  --exclude 'playwright-report' \
  --exclude 'coverage' \
  --exclude '.DS_Store' \
  ./ "$remote_host:/home/saber/apps/ahmed-portfolio/source/"

# The fixed command is deliberately expanded locally before SSH transmits it.
# shellcheck disable=SC2029
ssh "$remote_host" "$remote_deploy_command"
