# Product

## Platform

Responsive English-language web portfolio for Atajan, positioned as a freelance full-stack developer. The intended domain is https://atajan.org.

## Purpose

Help prospective international clients understand the developer's focus, inspect verified implementation work and start a project conversation. Full-stack development, backend systems, integrations and automation are positioning themes, not evidence of a particular employment level or commercial track record.

## Verified content

This portfolio is the one project supported by the available source. Its case study describes its React frontend, original Canvas/CSS artwork, contact API and deployment configuration. No completed Taxi/OpenRide, UIBE Hub or VPN case studies were verified during this work. Do not infer production readiness from repository presence or invent clients, outcomes, users, revenue, years of experience or testimonials.

The requested public profile https://github.com/annlegion returned HTTP 404 during verification and is not rendered as a working footer link. The checkout's source repository and authenticated GitHub account are associated with https://github.com/w01kn3w/portfolio and w01kn3w. These identities are not interchangeable. The footer links to the verified source repository. The owner-configured address `admin@atajan.org` exists in the original repository; successful delivery has not been verified. No Upwork or Kwork profile URL is confirmed.

## Implemented stack

React 19, TypeScript, Vite, CSS, Canvas 2D and self-hosted Manrope power the frontend. The optional server uses Node 24 native HTTP and Nodemailer for SMTP. GitHub Actions, GitHub Pages, Git, ESLint and the Node test runner are present in the repository. A dedicated VPS deployment workflow and Nginx/systemd examples are prepared but have not been applied to a server. No database is implemented. NestJS, Express, Docker and PostgreSQL are not verified experience claims in this product.

## Capabilities

The page contains an interactive hero, one portfolio case study, a labeled reference architecture with an implemented contact endpoint example, an interactive development process, a contact form, email copy action and source links. The technology map uses keyboard-operable category buttons with expanded state, source-evidence panels and repository links. Navigation, mobile layouts, reduced motion, pause controls, loading/error states and keyboard access are required parts of the experience. Project visuals are original interaction studies, not client screenshots.

## Delivery boundaries

The owner selected GitHub Pages in the current w01kn3w/portfolio repository with custom domain atajan.org. The Pages build uses root base and email-draft contact mode. Visitors explicitly review and send the draft in their own mail app. Pages does not run the Node API. The optional Node service validates and rate-limits requests, checks origin and body size, and sends plain-text mail through environment-configured SMTP. It returns 503 when SMTP is absent and never fabricates delivery success. Requests are not stored in a database. The in-memory rate limiter covers a single process only.

The approved visual direction is dark editorial digital luxury with sparse lime accents and English copy. It supersedes the earlier orange-and-paper design and Russian copy. The user authorized publication, while actual remote access, identity ownership, successful GitHub Actions, SMTP delivery and HTTPS deployment must be reported according to observed results. Configuration files alone do not mean atajan.org is connected. Preserve existing production services and obtain the owner's approval for changes that risk downtime. See `docs/deployment.md` for setup and rollback.
