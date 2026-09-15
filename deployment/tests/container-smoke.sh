#!/usr/bin/env bash
set -euo pipefail

readonly image="ahmed-saber-portfolio:1.0.0"
container_id=""
port=""

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(cd -- "$script_dir/../.." && pwd -P)"

cleanup() {
  if [[ -n "$container_id" ]]; then
    docker rm --force "$container_id" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

for candidate in {8080..8090}; do
  if ! nc -z 127.0.0.1 "$candidate" >/dev/null 2>&1; then
    port="$candidate"
    break
  fi
done

if [[ -z "$port" ]]; then
  echo "No free loopback port available in 8080-8090" >&2
  exit 1
fi

docker build \
  --platform linux/amd64 \
  --file "$repo_root/deployment/Dockerfile" \
  --tag "$image" \
  "$repo_root"
container_id="$(docker run --detach --platform linux/amd64 --publish "127.0.0.1:${port}:80" "$image")"

health_url="http://127.0.0.1:${port}/healthz"
for attempt in {1..20}; do
  if curl --connect-timeout 2 --max-time 5 --fail --silent "$health_url" >/dev/null; then
    break
  fi

  if [[ "$attempt" -eq 20 ]]; then
    echo "Container health check did not succeed after 20 attempts: $health_url" >&2
    exit 1
  fi

  sleep 1
done

curl --connect-timeout 2 --max-time 5 --fail --silent --show-error "http://127.0.0.1:${port}/" | grep --fixed-strings --quiet "move business forward"
