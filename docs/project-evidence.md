# Project evidence

Audited on 2026-10-27. Source baseline: commit `ab4c29588831606660e0ea73e3cbfc593567bf34`. This records source inspection, not a production-readiness certification.

## Identity and publication

- The requested profile `https://github.com/annlegion` returned HTTP 404 through the authenticated GitHub REST API. Repository search restricted to this handle returned HTTP 422. No accessible repositories could be attributed to that handle.
- The current checkout's existing origin is [w01kn3w/portfolio](https://github.com/w01kn3w/portfolio). GitHub reports it as a public, non-fork repository with default branch `main`.
- The CLI is authenticated as `w01kn3w`. [Baseline commit](https://github.com/w01kn3w/portfolio/commit/ab4c29588831606660e0ea73e3cbfc593567bf34) maps its author to that account. GitHub lists `w01kn3w` as the repository contributor. This does not establish that `annlegion` is the same account.
- `gh repo list w01kn3w --limit 100` returned only this portfolio. No additional project source was available through that account.

## Confirmed project: personal portfolio

Suggested public title: **Atajan / Developer portfolio**.

Overview: A personal React website with an interactive canvas illustration and a source-linked project archive. Its confirmed scope is frontend engineering and static publication automation.

Problem and solution: Present a developer identity and project archive using a typed React application, self-hosted fonts and a pointer-responsive canvas graphic. Do not imply customer outcomes or visitor metrics.

Role wording: "Personal project". Repository authorship is traceable to `w01kn3w`; broader team or commercial responsibilities have not been established.

| Confirmed detail | Source |
| --- | --- |
| React 19, TypeScript, Vite 7, ESLint | [package.json](https://github.com/w01kn3w/portfolio/blob/ab4c29588831606660e0ea73e3cbfc593567bf34/package.json) |
| Typed project data and portfolio source link | [src/content.ts](https://github.com/w01kn3w/portfolio/blob/ab4c29588831606660e0ea73e3cbfc593567bf34/src/content.ts) |
| Canvas 2D orbital illustration, pointer response, pause control, reduced-motion handling, viewport and document visibility handling | [src/Orbit.tsx](https://github.com/w01kn3w/portfolio/blob/ab4c29588831606660e0ea73e3cbfc593567bf34/src/Orbit.tsx) |
| React page composition, anchor navigation, clipboard contact control | [src/App.tsx](https://github.com/w01kn3w/portfolio/blob/ab4c29588831606660e0ea73e3cbfc593567bf34/src/App.tsx) |
| Local Manrope and Lora fonts, responsive styles, reduced-motion styling | [src/styles.css](https://github.com/w01kn3w/portfolio/blob/ab4c29588831606660e0ea73e3cbfc593567bf34/src/styles.css) |
| GitHub Actions dependency installation and check job | [ci.yml](https://github.com/w01kn3w/portfolio/blob/ab4c29588831606660e0ea73e3cbfc593567bf34/.github/workflows/ci.yml) |
| Main-branch build artifact and GitHub Pages deployment workflow | [deploy.yml](https://github.com/w01kn3w/portfolio/blob/ab4c29588831606660e0ea73e3cbfc593567bf34/.github/workflows/deploy.yml) |

Architecture: browser → React components → typed local project content; Canvas 2D renders the illustration. GitHub Actions builds a static `dist` artifact for GitHub Pages. No application API, database, authentication service or mail server exists in this baseline.

Engineering decisions supported by the code: use Canvas 2D without a 3D dependency; stop animation while hidden or outside the viewport; respect reduced motion; keep content separate from rendering; compile TypeScript before bundling.

Do not claim a verified live demo until its actual response and assets are checked. The baseline Vite configuration uses `/portfolio/` as its base path, so deployment at a domain root requires a deliberate build configuration change.

## Candidate projects awaiting evidence

OpenRide / Taxi, UIBE Hub and the VPN subscription platform remain unverified. Do not publish project case studies, stacks, screenshots presented as real product screens, architecture claims, completed-project status or links for them. Source repositories or developer-provided materials are needed first.

NestJS, Express, PostgreSQL, Telegram bots, geospatial dispatching, Docker, Nginx and application backend experience were not demonstrated by the available baseline source. The user's requested positioning can describe services offered, but must not be presented as verified past project experience. Any API or architecture illustration added to the site must be explicitly labeled as a demonstration or reference architecture.

## Contact evidence

- `admin@atajan.org` is explicitly configured in baseline [src/content.ts](https://github.com/w01kn3w/portfolio/blob/ab4c29588831606660e0ea73e3cbfc593567bf34/src/content.ts). This supports preserving it as the repository-configured contact address, but does not establish successful email delivery.
- DNS MX lookup on 2026-10-27 returned `eforward1` through `eforward5.registrar-servers.com`. This proves domain-level forwarding records exist; it does not prove the specific mailbox or forwarding rule works.
- The GitHub public profile API exposes no email for `w01kn3w`. No Upwork or Kwork profile URL was found in the inspected repository. Do not invent them.
- No SMTP credentials or provider configuration was found or requested. A contact form must not report successful delivery without a working service.
