# Next.js Portfolio and Docker Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the approved static portfolio into a maintainable Next.js application, preserve design v1 as an immutable reference, package it as a production container, and deploy it through the saved `myserver-saber` SSH connection.

**Architecture:** Next.js App Router renders a single statically exported portfolio route. Content lives in a typed data module, presentation is split into focused React components, and design tokens remain in global CSS. A multi-stage Docker build compiles the site and copies only `out/` into Nginx; Docker Compose exposes it on server port 80 and provides a health check.

**Tech Stack:** Next.js 16.3.3, React 19, TypeScript, CSS, Playwright, Node.js 24 LTS, Docker multi-stage builds, Nginx Alpine, Docker Compose, SSH, rsync.

**Spec:** `docs/design/portfolio-v1.md`

## Global Constraints

- Preserve the visual and responsive contract in `docs/design/portfolio-v1.md` unless a change is explicitly approved.
- Pin Next.js to security-patched Active LTS version `16.3.3`.
- Use `output: "export"`; production must not require a Node.js runtime.
- Keep all portfolio facts in `src/content/portfolio.ts`; do not invent employment claims, metrics, or project results.
- Keep `design-reference/v1/` immutable after its initial commit.
- Target `linux/amd64`, matching `myserver-saber`.
- Expose the container through server port `80`, which was confirmed unused on 2026-09-14.
- Do not add a contact form, analytics, database, authentication, or CMS in this migration.
- Do not configure TLS until a domain name is provided.

---

## Planned file structure

```text
.
├── design-reference/v1/
│   ├── index.html
│   ├── manifest.json
│   └── screenshots/{desktop,mobile}.png
├── docs/design/portfolio-v1.md
├── src/
│   ├── app/{globals.css,layout.tsx,page.tsx}
│   ├── components/{Architecture.tsx,Capabilities.tsx,Contact.tsx,Experience.tsx,Hero.tsx,Metrics.tsx,MobileNav.tsx,Reveal.tsx,SiteFooter.tsx,SiteHeader.tsx}
│   └── content/portfolio.ts
├── tests/e2e/portfolio.spec.ts
├── public/favicon.svg
├── next.config.ts
├── package.json
├── package-lock.json
├── playwright.config.ts
├── tsconfig.json
├── Dockerfile
├── compose.yaml
├── nginx.conf
├── .dockerignore
├── scripts/deploy.sh
└── README.md
```

### Task 1: Freeze design v1 before migration

**Files:**
- Create: `design-reference/v1/index.html`
- Create: `design-reference/v1/manifest.json`
- Create: `design-reference/v1/screenshots/desktop.png`
- Create: `design-reference/v1/screenshots/mobile.png`
- Use: `docs/design/portfolio-v1.md`

**Interfaces:**
- Consumes: current static source at commit `e8f3957b32e59507f3c61f96429868308fbaaa1b`.
- Produces: immutable design assets and Git tag `design-v1` used by later visual comparison.

- [ ] **Step 1: Tag the exact original design commit**

```bash
git tag -a design-v1 e8f3957b32e59507f3c61f96429868308fbaaa1b -m "Approved portfolio design v1"
git show --no-patch --format=%H design-v1
```

Expected: the command prints `e8f3957b32e59507f3c61f96429868308fbaaa1b`.

- [ ] **Step 2: Copy the static source without modifying it**

```bash
mkdir -p design-reference/v1/screenshots
cp dist/index.html design-reference/v1/index.html
cmp --silent dist/index.html design-reference/v1/index.html
```

Expected: `cmp` exits with status 0.

- [ ] **Step 3: Add the reference manifest**

```json
{
  "version": "v1",
  "sourceCommit": "e8f3957b32e59507f3c61f96429868308fbaaa1b",
  "gitTag": "design-v1",
  "figmaUrl": "https://www.figma.com/design/4VOWwJNowIKVYAv1k7EPkk",
  "prototypeUrl": "https://ahmed-saber-engineer.developersaber.chatgpt.site",
  "desktopViewport": { "width": 1440, "height": 1000 },
  "mobileViewport": { "width": 390, "height": 844 }
}
```

- [ ] **Step 4: Capture full-page visual baselines**

Run the reference HTML with a local static server, then capture it with Playwright:

```bash
npx playwright screenshot --full-page --viewport-size="1440,1000" http://127.0.0.1:4173/design-reference/v1/index.html design-reference/v1/screenshots/desktop.png
npx playwright screenshot --full-page --viewport-size="390,844" http://127.0.0.1:4173/design-reference/v1/index.html design-reference/v1/screenshots/mobile.png
```

Expected: both PNG files exist and have non-zero size.

- [ ] **Step 5: Commit the immutable reference package**

```bash
git add design-reference/v1 docs/design/portfolio-v1.md
git commit -m "docs: preserve portfolio design v1 reference"
```

### Task 2: Establish the Next.js static-export application

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `public/favicon.svg`
- Remove after migration passes: `dist/index.html`

**Interfaces:**
- Consumes: design reference from Task 1.
- Produces: `npm run dev`, `npm run build`, and a static `out/index.html`.

- [ ] **Step 1: Create the package contract**

```json
{
  "name": "ahmed-saber-portfolio",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start:static": "npx serve out -l 4173",
    "typecheck": "tsc --noEmit",
    "test:e2e": "playwright test",
    "check": "npm run typecheck && npm run build && npm run test:e2e"
  },
  "dependencies": {
    "next": "16.3.3",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.55.0",
    "@types/node": "^24.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.9.0"
  }
}
```

- [ ] **Step 2: Install from the declared contract**

```bash
npm install
```

Expected: `package-lock.json` is generated and `npm ls next react react-dom` exits successfully.

- [ ] **Step 3: Configure a portable static export**

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
```

- [ ] **Step 4: Add semantic metadata and the root route**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ahmed Saber — Senior Software Engineer",
  description: "Senior Software Engineer building scalable platforms across logistics, fintech, ERP, and security.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
```

```tsx
// src/app/page.tsx
export default function HomePage() {
  return <main id="main"><h1>Ahmed Saber</h1></main>;
}
```

- [ ] **Step 5: Verify the export contract**

```bash
npm run typecheck
npm run build
test -f out/index.html
```

Expected: all commands pass and `out/index.html` exists.

- [ ] **Step 6: Commit the application foundation**

```bash
git add package.json package-lock.json next.config.ts tsconfig.json src/app public/favicon.svg
git commit -m "build: establish Next.js static portfolio"
```

### Task 3: Move CV content into a typed source of truth

**Files:**
- Create: `src/content/portfolio.ts`
- Create: `src/content/portfolio.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `portfolio: Portfolio` consumed by every page component.
- `Portfolio` contains `profile`, `metrics`, `roles`, `capabilities`, `education`, and `links`.

- [ ] **Step 1: Add Vitest and a test script**

```bash
npm install --save-dev vitest
npm pkg set scripts.test="vitest run"
```

- [ ] **Step 2: Write the failing content-integrity test**

```ts
import { describe, expect, it } from "vitest";
import { portfolio } from "./portfolio";

describe("portfolio content", () => {
  it("preserves the approved career chronology and public links", () => {
    expect(portfolio.roles.map((role) => role.company)).toEqual([
      "Madar — Obeikan Digital Solutions",
      "T-Vencubator",
      "Digital Roots GTC",
      "Softlock",
    ]);
    expect(portfolio.links.github).toBe("https://github.com/DEV-A7med");
    expect(portfolio.links.email).toBe("mailto:developersaber@gmail.com");
  });
});
```

- [ ] **Step 3: Verify the test fails because the content module is missing**

```bash
npm test -- src/content/portfolio.test.ts
```

Expected: FAIL with an unresolved `./portfolio` import.

- [ ] **Step 4: Implement the typed content model**

Create exported types and the complete approved data. The public link object must be:

```ts
export const portfolio = {
  profile: {
    name: "Ahmed Saber",
    title: "Senior Software Engineer",
    location: "Cairo, Egypt",
    summary: "I’m Ahmed Saber, a full-stack engineer with 6+ years of experience turning complex logistics, fintech, ERP, and security challenges into scalable software.",
  },
  links: {
    email: "mailto:developersaber@gmail.com",
    github: "https://github.com/DEV-A7med",
    linkedin: "https://www.linkedin.com/in/ahmed-saber-1b549ab4/",
  },
  metrics: [
    { value: "6+", label: "Years engineering products" },
    { value: "4", label: "Business domains" },
    { value: "3", label: "Modern frontend platforms" },
    { value: "20–30%", label: "Estimated AI productivity lift" },
  ],
  roles: [
    { company: "Madar — Obeikan Digital Solutions", title: "Senior Software Engineer", period: "2024 — Present", domain: "Logistics", mode: "Hybrid", description: "Building technology for freight coordination, shipment tracking, and delivery optimization while improving supply-chain visibility across Obeikan Digital Solutions." },
    { company: "T-Vencubator", title: "Senior Software Engineer", period: "2023 — 2024", domain: "FinTech", mode: "Hybrid", description: "Designed payment microservices, integrated external adapters and communication protocols, and championed AI-assisted code review, testing, and documentation." },
    { company: "Digital Roots GTC", title: "Full-stack Engineer", period: "2021 — 2023", domain: "ERP", mode: "Remote", description: "Delivered Node.js and NestJS services, Angular and React interfaces, Odoo ERP customizations, Electron desktop tools, and integrity-focused legacy migrations." },
    { company: "Softlock", title: "Software Engineer", period: "2019 — 2020", domain: "Security", mode: "Onsite", description: "Built certificate-based login systems and cryptographic SDKs, plus management interfaces for OTP, FIDO2, Java Card, smart-card, and USB-token devices." }
  ],
  capabilities: [
    { label: "Backend systems", headline: "Services built for scale and clarity.", tags: ["Node.js", "NestJS", "Express", "Microservices", "RabbitMQ"] },
    { label: "Product interfaces", headline: "Fast, focused experiences across platforms.", tags: ["React", "Angular", "Electron", "TypeScript"] },
    { label: "Data & infrastructure", headline: "Reliable foundations for demanding workflows.", tags: ["PostgreSQL", "MongoDB", "Redis", "AWS", "Kubernetes"] },
    { label: "Engineering practice", headline: "Clean delivery with automation built in.", tags: ["CI/CD", "Jest", "ELK", "Datadog", "AI tooling"] }
  ],
  education: { degree: "Computer Science", institution: "Higher Technological Institute (HTI)", period: "2015 — 2019" },
  languages: "Native Arabic speaker with fluent professional English.",
} as const;

export type Portfolio = typeof portfolio;
```

- [ ] **Step 5: Run the content test**

```bash
npm test -- src/content/portfolio.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the content model**

```bash
git add package.json package-lock.json src/content
git commit -m "feat: add typed portfolio content"
```

### Task 4: Rebuild the page as focused React components

**Files:**
- Create: `src/components/Architecture.tsx`
- Create: `src/components/Capabilities.tsx`
- Create: `src/components/Contact.tsx`
- Create: `src/components/Experience.tsx`
- Create: `src/components/Hero.tsx`
- Create: `src/components/Metrics.tsx`
- Create: `src/components/MobileNav.tsx`
- Create: `src/components/Reveal.tsx`
- Create: `src/components/SiteFooter.tsx`
- Create: `src/components/SiteHeader.tsx`
- Modify: `src/app/page.tsx`
- Create: `tests/e2e/portfolio.spec.ts`
- Create: `playwright.config.ts`

**Interfaces:**
- Consumes: `portfolio` from Task 3.
- Produces: one accessible `/` route with the same sections and public actions as design v1.

- [ ] **Step 1: Write the failing desktop structure test**

```ts
import { expect, test } from "@playwright/test";

test("renders the approved portfolio structure", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("move business forward");
  await expect(page.locator("#experience article")).toHaveCount(4);
  await expect(page.locator("#capabilities article")).toHaveCount(4);
  await expect(page.getByRole("link", { name: /start a conversation/i })).toHaveAttribute("href", "mailto:developersaber@gmail.com");
});
```

- [ ] **Step 2: Configure Playwright against the production export**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: { command: "npm run start:static", port: 4173, reuseExistingServer: true },
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
```

- [ ] **Step 3: Run the test and confirm the minimal scaffold page fails**

```bash
npm run build
npm run test:e2e -- --project=desktop
```

Expected: FAIL because the experience and capability articles are absent.

- [ ] **Step 4: Implement the server-rendered section components**

Each content component accepts only its required slice. For example:

```tsx
import type { Portfolio } from "@/content/portfolio";

export function Experience({ roles }: { roles: Portfolio["roles"] }) {
  return (
    <section id="experience">
      <div className="wrap">
        <header className="sectionHead"><span className="kicker">01 / Experience</span><h2>Built in the real world, across complex domains.</h2></header>
        <div className="timeline">{roles.map((role) => <article className="role" key={role.company}><time>{role.period}</time><div><h3>{role.title} · {role.company}</h3><span>{role.domain} · {role.mode}</span><p>{role.description}</p></div></article>)}</div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Implement only the two necessary client components**

`MobileNav.tsx` owns the menu state and `Reveal.tsx` owns IntersectionObserver behavior. Both must preserve accessible labels and reduced-motion behavior; all other components remain Server Components.

```tsx
"use client";
import { useState } from "react";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return <button className="menu" aria-expanded={open} aria-controls="primary-nav" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>≡</button>;
}
```

- [ ] **Step 6: Compose the route in the approved order**

```tsx
import { portfolio } from "@/content/portfolio";

export default function HomePage() {
  return <><SiteHeader links={portfolio.links} /><main id="main"><Hero profile={portfolio.profile} links={portfolio.links} /><Metrics metrics={portfolio.metrics} /><Experience roles={portfolio.roles} /><Capabilities capabilities={portfolio.capabilities} /><Contact email={portfolio.links.email} /></main><SiteFooter links={portfolio.links} /></>;
}
```

- [ ] **Step 7: Run component and route checks**

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e -- --project=desktop
```

Expected: all commands PASS.

- [ ] **Step 8: Commit the component migration**

```bash
git add src tests playwright.config.ts
git commit -m "feat: migrate portfolio into React components"
```

### Task 5: Port the approved visual system and responsive behavior

**Files:**
- Create: `src/app/globals.css`
- Modify: `tests/e2e/portfolio.spec.ts`

**Interfaces:**
- Consumes: semantic class names from Task 4 and design tokens from the v1 spec.
- Produces: responsive visual parity at 1440px and 390px.

- [ ] **Step 1: Add failing responsive invariants**

```ts
test("has no horizontal overflow on desktop or mobile", async ({ page }) => {
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBe(dimensions.width);
});

test("mobile navigation exposes the section links", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.click();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
});
```

- [ ] **Step 2: Port the v1 tokens and typography**

Begin `globals.css` with the exact token block from `docs/design/portfolio-v1.md`, use `clamp()` for headings, and retain 16px minimum body copy.

- [ ] **Step 3: Port layouts and interaction states**

Implement the two-column desktop hero, four-column metrics, timeline, capability cards, responsive breakpoints at 900px and 680px, hover/focus states, sticky navigation, and reduced-motion media query.

- [ ] **Step 4: Compare against the immutable screenshots**

```bash
npm run build
npm run test:e2e
```

Capture the Next.js route at 1440×1000 and 390×844. Compare section order, typography scale, spacing rhythm, colors, cards, menu state, and absence of clipping against `design-reference/v1/screenshots/desktop.png` and `mobile.png`. Fix only migration differences; do not overwrite the reference images.

- [ ] **Step 5: Commit visual parity**

```bash
git add src/app/globals.css tests/e2e/portfolio.spec.ts
git commit -m "style: restore portfolio design v1 parity"
```

### Task 6: Package the static export in Docker

**Files:**
- Create: `Dockerfile`
- Create: `nginx.conf`
- Create: `compose.yaml`
- Create: `.dockerignore`
- Create: `tests/container-smoke.sh`

**Interfaces:**
- Consumes: `npm run build` output at `out/`.
- Produces: image `ahmed-saber-portfolio:local`, container port 80, `/healthz` endpoint.

- [ ] **Step 1: Write the failing container smoke test**

```bash
#!/usr/bin/env bash
set -euo pipefail
docker build --platform linux/amd64 -t ahmed-saber-portfolio:test .
container_id="$(docker run -d -p 127.0.0.1:8080:80 ahmed-saber-portfolio:test)"
trap 'docker rm -f "$container_id" >/dev/null' EXIT
for attempt in {1..20}; do curl --fail --silent http://127.0.0.1:8080/healthz && break; sleep 1; done
curl --fail --silent http://127.0.0.1:8080/ | grep -F "move business forward"
```

- [ ] **Step 2: Run the smoke test before Docker support exists**

```bash
bash tests/container-smoke.sh
```

Expected: FAIL because `Dockerfile` is missing.

- [ ] **Step 3: Create the multi-stage Dockerfile**

```dockerfile
# syntax=docker/dockerfile:1
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run typecheck && npm test && npm run build

FROM nginx:1.29-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q --spider http://127.0.0.1/healthz || exit 1
```

- [ ] **Step 4: Add Nginx static and cache rules**

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;
  add_header X-Content-Type-Options nosniff always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;
  location = /healthz { access_log off; add_header Content-Type text/plain; return 200 "ok\n"; }
  location /_next/static/ { expires 1y; add_header Cache-Control "public, immutable"; }
  location / { try_files $uri $uri/ $uri.html =404; }
}
```

- [ ] **Step 5: Add the production Compose service**

```yaml
services:
  portfolio:
    build:
      context: .
      target: runtime
    image: ahmed-saber-portfolio:latest
    container_name: ahmed-saber-portfolio
    restart: unless-stopped
    ports:
      - "80:80"
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://127.0.0.1/healthz"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

- [ ] **Step 6: Exclude local and reference-only artifacts from the image context**

```dockerignore
.git
.next
node_modules
out
test-results
playwright-report
design-reference
docs
```

- [ ] **Step 7: Run the container checks**

```bash
bash tests/container-smoke.sh
docker compose config --quiet
```

Expected: PASS, homepage contains the approved hero text, and `/healthz` returns 200.

- [ ] **Step 8: Commit the container package**

```bash
git add Dockerfile nginx.conf compose.yaml .dockerignore tests/container-smoke.sh
git commit -m "build: package portfolio with Docker and Nginx"
```

### Task 7: Add the repeatable SSH deployment workflow

**Files:**
- Create: `scripts/deploy.sh`
- Create: `README.md`

**Interfaces:**
- Consumes: local Git revision, SSH alias `myserver-saber`, remote directory `/home/saber/apps/ahmed-portfolio`.
- Produces: repeatable deployment command `bash scripts/deploy.sh` and a healthy Compose service on port 80.

- [ ] **Step 1: Write the deploy script with local gates and scoped synchronization**

```bash
#!/usr/bin/env bash
set -euo pipefail

remote="myserver-saber"
remote_dir="/home/saber/apps/ahmed-portfolio/source"

npm ci
npm run check
bash tests/container-smoke.sh

ssh "$remote" "mkdir -p '$remote_dir'"
rsync --archive --compress --delete \
  --exclude .git --exclude .next --exclude node_modules --exclude out \
  --exclude test-results --exclude playwright-report \
  ./ "$remote:$remote_dir/"

ssh "$remote" "cd '$remote_dir' && docker compose up -d --build --remove-orphans && docker compose ps && curl --fail --silent http://127.0.0.1/healthz"
```

The `--delete` scope is limited to `/home/saber/apps/ahmed-portfolio/source`, which is dedicated to this application.

- [ ] **Step 2: Document operations and rollback**

The README must document:

```bash
# deploy
bash scripts/deploy.sh

# inspect
ssh myserver-saber 'cd /home/saber/apps/ahmed-portfolio/source && docker compose ps && docker compose logs --tail=100 portfolio'

# stop
ssh myserver-saber 'cd /home/saber/apps/ahmed-portfolio/source && docker compose down'

# restore design-v1 source locally for comparison
git show design-v1:dist/index.html > /tmp/portfolio-design-v1.html
```

Also state that HTTPS requires a real domain pointing to `169.58.240.185`; it is intentionally outside this migration.

- [ ] **Step 3: Validate the deployment script without modifying the server**

```bash
bash -n scripts/deploy.sh
shellcheck scripts/deploy.sh
```

Expected: both checks PASS.

- [ ] **Step 4: Commit deployment automation**

```bash
git add scripts/deploy.sh README.md
git commit -m "ops: add saber server deployment workflow"
```

### Task 8: Deploy and verify on `myserver-saber`

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: Task 7 deployment script and confirmed server Docker access.
- Produces: portfolio available at `http://169.58.240.185/` with a healthy container.

- [ ] **Step 1: Run all local quality gates**

```bash
npm run check
bash tests/container-smoke.sh
git status --short
```

Expected: checks PASS and the working tree is clean.

- [ ] **Step 2: Deploy through the configured SSH alias**

```bash
bash scripts/deploy.sh
```

Expected: Compose reports `ahmed-saber-portfolio` as running and healthy.

- [ ] **Step 3: Verify the server locally and externally**

```bash
ssh myserver-saber 'curl --fail --silent http://127.0.0.1/healthz && docker inspect --format={{.State.Health.Status}} ahmed-saber-portfolio'
curl --fail --silent http://169.58.240.185/ | grep -F "move business forward"
```

Expected: health endpoint prints `ok`, Docker prints `healthy`, and the public homepage contains the hero text.

- [ ] **Step 4: Validate the deployed responsive page in a browser**

Check 1440×1000 and 390×844 viewports. Confirm navigation, email, LinkedIn and GitHub destinations; confirm no console errors, horizontal overflow, clipped text, or unintended motion under reduced-motion preferences.

- [ ] **Step 5: Record the deployed revision**

```bash
git rev-parse --verify HEAD
ssh myserver-saber 'docker inspect --format={{.Image}} ahmed-saber-portfolio'
```

Store both values in the deployment notes section of `README.md`, then commit:

```bash
git add README.md
git commit -m "docs: record initial saber deployment"
```

## Self-review results

- Spec coverage: design preservation, framework migration, responsive behavior, testing, Docker packaging, SSH deployment, health verification, and rollback reference are covered.
- Incomplete-marker scan: no unfinished implementation markers remain; the only deferred concern is TLS, explicitly excluded because no domain was supplied.
- Type consistency: every UI component consumes a slice of the exported `Portfolio` type; Docker and deployment paths consistently use `out/`, port 80, `myserver-saber`, and `/home/saber/apps/ahmed-portfolio/source`.
