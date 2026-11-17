# Atajan Labs portfolio

React 19, TypeScript and Vite frontend for the existing Atajan Labs platform. English/Russian content, original Canvas graphics, source-backed project case studies and an integrated project inquiry form.

## Local development

Use Node 24. On PowerShell, use npm.cmd if npm.ps1 is blocked.

```sh
npm ci
npm run check
npm run test:browser
npm start
```

The production server binds to loopback at localhost:3000 by default. For Vite development use npm run dev. The public CMS origin defaults to https://labs.atajan.org/api/v1 and is configurable with VITE_PORTFOLIO_API_URL. VITE_ADMIN_ORIGIN pins the preview message sender. These are public build settings; never put credentials in VITE_* variables.

The existing optional Node SMTP endpoint remains available for legacy integrations. It is separate from the new public inquiry form and returns503 when SMTP is absent. The portfolio form now uses the existing Railway backend, stores a CRM inquiry after successful validation and preserves email links as fallback. A timeout never claims delivery.

## Content and architecture

The existing administration at labs.atajan.org manages portfolio content. Public content includes only published snapshots. No extra administrator login or database is introduced. Exact retries preserve the same inquiry identifier; changing a failed inquiry creates a fresh identifier. Draft preview accepts only the configured administration origin and opener, with bounded image Blobs and no session token transport.

A failed CMS read uses the explicit verified bundled snapshot from src/portfolio-data.ts. A successful empty publication is not merged with that snapshot. The portfolio case study is backed by this repository. No clients, testimonials, revenue or performance outcomes are invented. The current owner GitHub is w01kn3w; existing valid email, Instagram and phone contacts are preserved.

All sections, project details, navigation, contacts, services, technologies, legal content and global design values use CMS fields. Section headings and footer copy use HOMEPAGE entries; see the [integration contract](docs/portfolio-integration.md). The original Orbit animation, pause/reduced-motion behavior, geometric Architecture exploration and optional SMTP service remain. The old cursor source is retained for rollback but no longer mounted.

## Checks

npm run check runs ESLint, both TypeScript projects, seven Node tests and a production build. npm run test:browser runs real Chromium against an isolated production server, with mocked CMS and inquiry responses. It checks rendering, language persistence, navigation, projects, idempotent retries, empty/error states, preview isolation, responsive overflow, original animation controls, custom404 and axe WCAG A/AA rules. It creates local desktop/mobile evidence under ignored .impeccable/review/. No real inquiries or financial transactions are created by the suite.

## Hosting and rollback

The selected portfolio host remains GitHub Pages at atajan.org. Only reviewed main pushes or an explicit main workflow dispatch can deploy. This feature branch has not been deployed. No DNS changes are required. The existing Railway backend must be upgraded separately after owner approval, with its documented backup and migration procedure.

Vite emits static project/legal pages with canonical URLs, metadata, noscript content and a generated sitemap. By default these use the verified bundled snapshot. To refresh crawler metadata after publishing CMS edits, export the public document to an ignored local file and set PORTFOLIO_BUILD_CONTENT_FILE for the build. Runtime UI content updates through the public API; social previews need a new Pages build. The default CI build is deterministic and makes no privileged API requests.

Rollback uses a reviewed revert of the feature release on main followed by the existing Pages workflow. Reverting the frontend does not delete portfolio content or existing business data. Never use a destructive database rollback. See [portfolio integration](docs/portfolio-integration.md) and the root platform deployment guide for backend rollout boundaries.

## Design and assets

[DESIGN.md](DESIGN.md) records the current white/gray/blue visual system. Manrope is self-hosted under its existing license. The approved Origin mark is reused from the platform. Technology SVGs are local Simple Icons CC0 assets with provenance in public/technology/LICENSE.txt. Social artwork is authored SVG geometry rendered to a 1200×630 PNG. Project graphics are original interaction compositions, not customer screenshots.
