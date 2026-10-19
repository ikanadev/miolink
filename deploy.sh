#!/bin/sh
# Builds the miobackend and mioweb images for the current commit, sends them to
# the server over SSH (no registry), sets MIOLINK_VERSION in the server's .env
# and restarts the stack there with docker compose.
#
#   ./deploy.sh
#
# MIOLINK_DEPLOY_HOST  SSH host (default "home-server")
# MIOLINK_DEPLOY_DIR   compose directory on the server, relative to its home
#                      (default "server/homeserver/apps/miolink")
# DOCKER               local build tool (default "podman"; "docker" works too)
set -eu

host=${MIOLINK_DEPLOY_HOST:-home-server}
dir=${MIOLINK_DEPLOY_DIR:-server/homeserver/apps/miolink}
docker=${DOCKER:-podman}
# Older versions kept on the server for rollback, besides the running one.
keep=5

cd "$(dirname "$0")"

# Every tag must match a commit, so the build contexts must be clean.
if [ -n "$(git status --porcelain -- miobackend mioweb)" ]; then
  echo "deploy: commit or stash the changes in miobackend/ and mioweb/ first" >&2
  exit 1
fi

version=$(git rev-parse --short HEAD)
# Podman stores unqualified names under localhost/, so the names are written
# that way here and in the server's compose file, for both Podman and Docker.
backend=localhost/miolink/miobackend:$version
web=localhost/miolink/mioweb:$version

echo "==> Building $version"
"$docker" build -t "$backend" miobackend
"$docker" build -t "$web" mioweb

# One image per archive: podman save with several names and no -m writes a
# single image tagged with all of them.
for image in "$backend" "$web"; do
  echo "==> Sending $image to $host"
  "$docker" save "$image" | gzip | ssh "$host" 'gunzip | docker load'
done

echo "==> Starting $version on $host"
ssh "$host" sh -s -- "$dir" "$version" "$keep" <<'EOF'
set -eu
cd "$1"
if [ ! -f .env ]; then
  echo "deploy: $PWD/.env is missing; copy .env.example and fill it in" >&2
  exit 1
fi
if grep -q '^MIOLINK_VERSION=' .env; then
  sed -i "s/^MIOLINK_VERSION=.*/MIOLINK_VERSION=$2/" .env
else
  printf 'MIOLINK_VERSION=%s\n' "$2" >> .env
fi
docker compose up -d
docker compose ps

# Remove all but the newest versions; images in use are skipped by rmi.
for repo in localhost/miolink/miobackend localhost/miolink/mioweb; do
  docker images "$repo" --format '{{.Repository}}:{{.Tag}}' |
    tail -n +"$(($3 + 2))" | xargs -r docker rmi >/dev/null 2>&1 || true
done
docker image prune -f >/dev/null
EOF

echo "==> Deployed $version"
