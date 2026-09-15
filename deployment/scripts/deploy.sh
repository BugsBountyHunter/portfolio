#!/usr/bin/env bash
set -euo pipefail

readonly remote_host="myserver-saber"
readonly remote_source_dir="/home/saber/apps/ahmed-portfolio/source"
readonly remote_mkdir_command="mkdir -p '$remote_source_dir'"
readonly remote_deploy_command="cd '$remote_source_dir' && docker compose -f deployment/compose.yaml up -d --build --remove-orphans && docker compose -f deployment/compose.yaml ps"
# The loop variables must expand on the remote shell, not while this script starts.
# shellcheck disable=SC2016
readonly remote_health_command='attempt=1; max_attempts=20; while [ "$attempt" -le "$max_attempts" ]; do if curl --fail --silent --show-error --connect-timeout 2 --max-time 5 http://127.0.0.1/healthz; then exit 0; fi; if [ "$attempt" -eq "$max_attempts" ]; then printf "Portfolio health check failed after %s attempts.\n" "$max_attempts" >&2; exit 1; fi; attempt=$((attempt + 1)); sleep 2; done'

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(cd -- "$script_dir/../.." && pwd -P)"
cd "$repo_root"

local_revision="$(git rev-parse --verify HEAD)"
printf 'Preparing deployment of local revision %s from %s\n' "$local_revision" "$repo_root"

npm --prefix nextjs ci
npm --prefix nextjs run check
bash deployment/tests/container-smoke.sh

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

# The fixed command retries a bounded number of times after Compose reports status.
# shellcheck disable=SC2029
ssh "$remote_host" "$remote_health_command"
