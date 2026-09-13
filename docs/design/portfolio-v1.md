# Ahmed Saber Portfolio - Design Reference v1

## Canonical reference

- Original implementation commit: `e8f3957b32e59507f3c61f96429868308fbaaa1b`
- Git tag to create before migration: `design-v1`
- Source reference: `dist/index.html`
- Figma reference: `https://www.figma.com/design/4VOWwJNowIKVYAv1k7EPkk`
- Published prototype: `https://ahmed-saber-engineer.developersaber.chatgpt.site`

The current static HTML is the visual source of truth for migration. The Next.js implementation may change markup and component boundaries, but it must preserve the visual identity, content order, responsive behavior, and interaction intent recorded here.

## Visual thesis

An editorial engineering portfolio: dark graphite surfaces, electric mint accents, technical mono labels, generous typography, and a lightweight animated architecture motif. It should feel precise and senior without resembling a generic dashboard or developer template.

## Design tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `--bg` | `#090d12` | Page background |
| `--surface` | `#0d131b` | Section and navigation surfaces |
| `--raised` | `#141c26` | Raised cards and architecture core |
| `--text` | `#f4f7f5` | Primary text |
| `--muted` | `#9da8a3` | Supporting copy and metadata |
| `--mint` | `#53e0c1` | Primary accent and action color |
| `--cyan` | `#6ea8fe` | Secondary system accent |
| `--line` | `rgba(244,247,245,.12)` | Borders and separators |

Typography:

- Display and headings: Space Grotesk, weights 500-700.
- Body and navigation: Manrope, weights 400-600.
- Technical labels: IBM Plex Mono, weight 500.
- Body copy remains at least 16px with comfortable line height.

## Content order

1. Sticky navigation with Experience, Capabilities, About, and email contact.
2. Hero positioning Ahmed as a Senior Software Engineer in Cairo.
3. Architecture motif and primary links to email and GitHub.
4. Four career metrics.
5. Experience timeline: Madar, T-Vencubator, Digital Roots GTC, Softlock.
6. Four capability cards: backend, frontend, data/infrastructure, engineering practice.
7. Education and languages.
8. Contact statement and footer links to LinkedIn and GitHub.

## Responsive contract

- Desktop: two-column hero, four-column metrics, two-column capability grid.
- Tablet: stacked hero, two-column metrics, single-column timeline labels.
- Mobile at 390px: menu button replaces desktop navigation; capability and profile cards stack; no horizontal scrolling.
- Respect `prefers-reduced-motion`; content must remain visible when motion is disabled.
- Keyboard focus uses the mint accent and all interactive controls retain accessible names.

## Future change policy

- Never edit files under `design-reference/v1/` after they are created.
- Record intentional design changes in a new `docs/design/portfolio-vN.md` file and `design-vN` tag.
- Run visual regression checks against the v1 desktop and mobile screenshots during migration.
- After migration, update screenshots only when a new design version is explicitly approved; do not overwrite v1 baselines.

