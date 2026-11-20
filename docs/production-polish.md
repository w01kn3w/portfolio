# Production polish, November 2026

This report supersedes the older verification and deployment observations dated October 2026. The existing white, gray and blue identity, Manrope font, Origin logo, interactive Canvas, CMS, two published projects and GitHub Pages custom domain are preserved.

## Audit and implemented changes

Reviewed the React components, local content and CMS contract, frontend and server TypeScript configuration, styles and responsive rules, static assets and licenses, Vite output, optional SMTP server and its tests, browser suite, environment example, GitHub workflows and deployment documentation.

| Finding | Implemented change |
| --- | --- |
| Public phone text and telephone link | Removed the rendering and bundled phone field. WhatsApp uses only the owner-approved chat URL. The legacy CMS phone field is ignored by the interface and stripped from generated snapshots. |
| Different contact lists in the footer and contact section | Shared `ContactLinks` component with email, WhatsApp, GitHub, Instagram and the existing Telegram bot. Brand icons, accessible names, 48px primary targets, 44px footer targets, focus and hover states. |
| Homepage did not identify the individual developer immediately | Added a concise personal introduction alongside the existing CMS proposition. Preserved the published services and factual content. |
| Identical portfolio illustration used for the services platform | Added a platform implementation diagram. Detail pages explicitly identify authored illustrations rather than implying they are product screenshots. |
| API failure discarded the current published projects | Embedded the public build snapshot for the initial render and API-failure recovery. A successful empty CMS response still stays empty. Both currently published projects survive an outage in a CMS-backed build. |
| Email draft mode documented but not implemented by the CMS form | Restored `VITE_CONTACT_MODE=email`. Preparing a draft never claims delivery. API failures offer a draft containing the entered message. API success still requires explicit confirmation. |
| Whitespace validation and editing during submission | Added trimmed validation with native error feedback and made text fields read-only during submission. Existing honeypot, timeouts and idempotent retries remain. |
| Mobile text fields and keyboard menu | Form controls use 16px text to avoid iOS focus zoom. Focus is visible. Escape closes the mobile menu and restores focus to its button. |
| Homepage crawler content and social cards could differ from CMS | Build-generated homepage content, published project links and snapshots now use the same export as project pages. Twitter metadata follows each route, locale and Open Graph image. |
| Legal titles reverted to the homepage after React loaded | Route-specific legal metadata and canonical URLs now persist. Unknown routes and private previews have `noindex`. Static 404 output also has `noindex`. |
| Development dependency advisories | Updated compatible lockfile resolutions with `npm audit fix`. No new runtime dependency was added. |

## Contact destinations

- Email uses `mailto:wolkannaberdiyew@gmail.com`.
- WhatsApp uses the approved `wa.me` destination and professional prefilled message. The phone number is not rendered as text, a tooltip, an accessible name or metadata.
- GitHub uses `https://github.com/w01kn3w`.
- Instagram uses `https://www.instagram.com/annaberdi_yev/`.
- Telegram uses the existing `https://t.me/atajanlabs_bot` service bot.

External contact and case study links use `noopener noreferrer` when opening a new tab. A WhatsApp destination necessarily contains its number in its URL; the number is not a secret in that destination. The separate public CMS may still return its legacy phone field, which this frontend does not display or embed.

## Verification

- `npm.cmd ci` completed on Node 24.20.0. PowerShell blocks the `npm.ps1` shim, so commands use `npm.cmd`.
- `npm.cmd run check` runs the actual lint, frontend/server typecheck, seven Node tests and Vite production build.
- `npm.cmd run test:browser` runs Chromium against the production artifact with controlled CMS/inquiry responses. No genuine customer inquiry is sent by this suite.
- Browser coverage includes 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px, menu navigation and Escape/focus restoration, contact destinations and hidden phone text, languages, project/legal routes, email fallback content, API confirmation and failure, retries, empty/error publication, Canvas pause and reduced motion, preview origin isolation, static metadata and sitemap.
- Axe tests WCAG 2 A/AA and WCAG 2.1 AA rules. Automated checks do not replace testing with assistive technology.
- Independently exercised an email-mode production build through the shared browser. Preparing the draft retained the input, encoded the message and email, and displayed an explicit unsent status. No email was sent.
- Inspected the desktop and mobile interface and the platform project route. The published CMS export contains 49 entries and both existing projects. Generated HTML excludes the legacy phone field.
- `npm audit fix` and a subsequent production dependency audit reported zero vulnerabilities.
- Ran the Impeccable detector once. Its findings were advisory palette documentation differences, including existing illustration, status and preview colors. The light studio palette remains intact.

Local browser timing is diagnostic, not a production Core Web Vitals guarantee. No current field data or current Lighthouse score is claimed. Older scores in `docs/verification.md` belong to an earlier version.

## Changed implementation files

`src/ContactLinks.tsx`, `src/App.tsx`, `src/styles.css`, `src/content.ts`, `src/portfolio-data.ts`, `index.html`, `vite.config.ts`, `scripts/verify-browser.mjs` and `package-lock.json`. Hosting notes and this report document the current behavior.

## Publication and rollback

The existing main-only GitHub Pages workflow runs installation, checks, a Chromium browser suite, uploads `dist`, deploys Pages and checks HTTPS. `PORTFOLIO_CMS_ENABLED=true` is already configured, so it exports the public CMS document before building. No DNS, custom domain or backend deployment change is needed. The production form continues to use the existing CMS inquiry API; email drafts are its recovery path.

After future CMS publication, rerun the Pages workflow to refresh static crawler content and the outage snapshot. To use only email drafts, set `VITE_CONTACT_MODE=email` in the build environment and rebuild. Reverting this release with a new commit on main triggers the same checked deployment process.

## Content and verification limits

No client results, testimonials, revenue, experience or completion dates were invented. Existing published projects were retained. Real project screenshots and a public source link for the services platform are not supplied in this repository; approved screenshots and a public repository URL would improve that case study. External social platforms may require login. Actual mailbox delivery and the live CMS success path were not tested by creating a real submission; automated success/failure responses are controlled fixtures.

The optional SMTP server remains separate from the CMS inquiry API and requires its own existing configuration. No infrastructure, payments or administrator authentication was changed. Impeccable's project context uses an older schema and sidecar; its `init` and `document` commands can refresh those records separately from this release.
