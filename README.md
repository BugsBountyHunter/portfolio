# Ahmed Saber Portfolio

A static Next.js portfolio packaged as an Nginx container. The application is
deployed to the Saber server through the saved `myserver-saber` SSH alias.

## Architecture

- Next.js App Router statically exports the portfolio into `out/`.
- Portfolio content is maintained in `src/content/portfolio.ts`; focused React
  components render the sections.
- A multi-stage Docker build creates the static export and copies it into
  Nginx. Docker Compose runs the `ahmed-saber-portfolio` container on port 80
  with a `/healthz` health check.
- `scripts/deploy.sh` validates the local checkout, synchronizes only the
  application source to `/home/saber/apps/ahmed-portfolio/source`, and runs
  Docker Compose on the server.

GitHub is not required for development or deployment. No Git remote is
configured for this repository; the deployment wrapper uses SSH and `rsync`
directly.

## Prerequisites

- Node.js 24 LTS and npm
- Docker with Docker Compose v2 for container commands and smoke testing
- Playwright browsers for end-to-end checks (`npx playwright install` when
  needed)
- For deployment only: configured `myserver-saber` SSH access, `rsync`, and
  Docker Compose available on the server

## Local setup and checks

```bash
npm ci
npm run dev
```

The development server is then available at the address printed by Next.js.

```bash
# Type checking
npm run typecheck

# Unit tests
npm test

# Static production export
npm run build

# End-to-end browser tests
npm run test:e2e

# Required local quality gate: typecheck, build, and E2E tests
npm run check
```

## Design v1 reference

`design-reference/v1/` is the immutable source-and-screenshot reference for
the approved first design, anchored by the `design-v1` Git tag. Do not edit
that directory after its initial commit. A visual or responsive change requires
explicit approval, a new versioned reference (for example `v2`), and matching
updates to the design documentation and tests; it must not overwrite v1.

To restore the legacy design-v1 HTML locally for comparison:

```bash
git show design-v1:dist/index.html > /tmp/portfolio-design-v1.html
```

## Docker and Compose

Build and run the production container locally:

```bash
docker compose up -d --build
docker compose ps
curl --fail --silent http://127.0.0.1/healthz
```

The Compose service is named `portfolio`, while its image and container are
both named `ahmed-saber-portfolio` and serve port 80. Run the end-to-end
container check, which builds the image and uses a temporary loopback port:

```bash
bash tests/container-smoke.sh
```

Stop the local Compose service when finished:

```bash
docker compose down
```

## Deployment

> Warning: deployment changes the remote server. Obtain explicit approval for
> that external action before running this command. The script is intentionally
> not run as part of routine local validation.

From the repository root, run:

```bash
bash scripts/deploy.sh
```

The script resolves the repository root, records the local Git revision in its
output, then runs `npm ci`, `npm run check`, and `bash tests/container-smoke.sh`
before contacting the server. It creates and synchronizes only the dedicated
remote source directory `/home/saber/apps/ahmed-portfolio/source`. Its rsync
`--delete` option is scoped strictly to that directory; it excludes Git and
local build, dependency, test, coverage, and operating-system metadata.

After synchronization, the remote command runs `docker compose up -d --build
--remove-orphans`, shows service status, then makes up to 20 localhost health
checks. Each check uses bounded connect and response timeouts; a clear failure
is returned if the service never becomes ready. No secrets, TLS configuration,
or domain configuration are included.

Inspect the remote service and recent logs:

```bash
ssh myserver-saber 'cd /home/saber/apps/ahmed-portfolio/source && docker compose ps && docker compose logs --tail=100 portfolio'
```

Stop the remote service:

```bash
ssh myserver-saber 'cd /home/saber/apps/ahmed-portfolio/source && docker compose down'
```

### Roll back to a known application revision

Deployment is source-based, so roll back by starting from a clean local
checkout of a previously deployed, known-good application revision that includes
this deployment tooling, then deploying it with explicit approval. The normal
deployment gates run again before the remote source and container are replaced.

```bash
git switch --detach <known-good-app-revision>
bash scripts/deploy.sh
```

Older revisions, including the `design-v1` source, are comparison and recovery
references only. They predate the Docker deployment tooling and cannot be
deployed directly with this script.

Return to the development branch after the rollback if appropriate:

```bash
git switch feat/nextjs-portfolio
```

### Initial deployment record (pending Task 8)

The first deployment has not yet been performed. Task 8 will record the values
after an approved deployment; do not invent them here.

| Field | Value |
| --- | --- |
| Local Git revision | Pending initial deployment |
| Server image ID | Pending initial deployment |
| Server health verification | Pending initial deployment |

## TLS and domain

HTTPS is intentionally deferred until a real domain points to `169.58.240.185`.
This migration does not configure TLS, certificates, redirects, or a domain.
