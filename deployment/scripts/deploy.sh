#!/usr/bin/env bash
set -euo pipefail

readonly remote_host="saber-server"
readonly remote_releases_dir="/home/saber/apps/ahmed-portfolio/releases"
# The loop variables must expand on the remote shell, not while this script starts.
# shellcheck disable=SC2016
readonly remote_health_command='attempt=1; max_attempts=20; while [ "$attempt" -le "$max_attempts" ]; do if curl --fail --silent --show-error --connect-timeout 2 --max-time 5 http://127.0.0.1/healthz; then exit 0; fi; if [ "$attempt" -eq "$max_attempts" ]; then printf "Portfolio health check failed after %s attempts.\n" "$max_attempts" >&2; exit 1; fi; attempt=$((attempt + 1)); sleep 2; done'

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(cd -- "$script_dir/../.." && pwd -P)"
cd "$repo_root"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Commit or stash local changes before deploying." >&2
  exit 1
fi

local_revision="$(git rev-parse --verify HEAD)"
# Each revision gets its own directory, so a deployment never deletes server files.
readonly remote_release_dir="$remote_releases_dir/$local_revision"
readonly remote_mkdir_command="mkdir -p '$remote_release_dir'"
readonly remote_deploy_command="cd '$remote_release_dir' && PORTFOLIO_IMAGE='ahmed-saber-portfolio:$local_revision' docker compose -f deployment/compose.yaml up -d --build --remove-orphans && PORTFOLIO_IMAGE='ahmed-saber-portfolio:$local_revision' docker compose -f deployment/compose.yaml ps"

printf 'Preparing deployment of local revision %s from %s\n' "$local_revision" "$repo_root"

npm --prefix nextjs ci
npm --prefix nextjs run check
bash deployment/tests/container-smoke.sh

# The fixed command is deliberately expanded locally before SSH transmits it.
# shellcheck disable=SC2029
ssh "$remote_host" "$remote_mkdir_command"
rsync --archive --compress \
  --exclude '.git' \
  --exclude '.superpowers' \
  --exclude '.next' \
  --exclude 'node_modules' \
  --exclude 'out' \
  --exclude 'test-results' \
  --exclude 'playwright-report' \
  --exclude 'coverage' \
  --exclude '.DS_Store' \
  ./ "$remote_host:$remote_release_dir/"

# The fixed command is deliberately expanded locally before SSH transmits it.
# shellcheck disable=SC2029
ssh "$remote_host" "$remote_deploy_command"

# The fixed command retries a bounded number of times after Compose reports status.
# shellcheck disable=SC2029
ssh "$remote_host" "$remote_health_command"
