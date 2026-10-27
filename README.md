# Atajan portfolio

English developer portfolio built with React 19, TypeScript and Vite. Original Canvas graphics, one verified project case study, interactive architecture and technology explorers, and an optional Node 24 contact service.

## Run locally

Use Node 24 or newer.

```sh
npm ci
npm run check
npm start
```

Open http://localhost:3000 after the build. The default server binds to loopback and expects that exact browser origin. On PowerShell use `npm.cmd` if local script policy blocks `npm.ps1`.

For frontend development run `npm run dev`. To test mail through the development proxy, start the Node service with `APP_ORIGIN=http://127.0.0.1:5173` in a local ignored `.env`; visit that same Vite origin. Never put SMTP values into a `VITE_` variable.

## Checks

- `npm run lint`: ESLint with no warnings.
- `npm run typecheck`: frontend and server TypeScript.
- `npm test`: contact validation, delivery failure/success, abuse controls and static serving.
- `npm run build`: root-domain production bundle and custom `404.html`.
- `npm run test:browser`: real Chromium integration checks against a temporary local production server. Run `npx playwright install chromium` first on Linux/macOS. On Windows the script uses installed Chrome. Tests cover responsive overflow, project expansion, architecture, keyboard controls, contact failures, cursor, reduced motion, touch, 404, assets and axe WCAG A/AA rules.

CI runs all of these on pull requests and main pushes. The custom-domain Pages build uses `VITE_BASE_PATH=/` and `VITE_CONTACT_MODE=email`.

## Content and evidence

`src/content.ts` contains identity, source and technology data. `src/App.tsx` holds the case study. Add only facts supported by source or owner-provided material. See [project evidence](docs/project-evidence.md). Only this portfolio was verified. Taxi/OpenRide, UIBE Hub and VPN candidates are omitted pending access to their source.

The supplied `annlegion` GitHub profile returned 404 during the audit. The existing authenticated remote is `w01kn3w/portfolio`; it is retained as the source link. Confirm the intended account before changing remotes. `admin@atajan.org` was already in the repository; mailbox delivery is unverified.

## Contact

The public contacts supplied by the owner are wolkannaberdiyew@gmail.com, Instagram @annaberdi_yev and phone +8613521004012. The Pages build uses email-draft contact mode; visitors review and send the draft in their own mail app.

The optional API mode requires `server/index.ts` and configured SMTP. Copy `.env.example` to an ignored `.env` and configure the provider privately. Without mail configuration the API returns HTTP 503, and the UI reports that delivery is unavailable. No enquiry is stored. SMTP acceptance is not a guarantee of inbox delivery.

## Publish and rollback

The selected hosting is GitHub Pages at atajan.org. See [domain setup](docs/github-pages.md) for the owner DNS steps. Main pushes publish the static bundle automatically. Pages cannot run a Node server. The alternative VPS workflow stays disabled. See [deployment instructions](docs/deployment.md) for that optional future path and rollback.

For a code rollback, revert the release commit on main and push after review. The VPS release script retains previous release directories and automatically restores the previous `current` symlink if activation fails; manual rollback commands are documented in the deployment guide.

## Design and assets

[DESIGN.md](DESIGN.md) records actual visual tokens. Manrope is self-hosted as WOFF2, converted from the existing licensed TTF; license text remains under `assets/`. Social artwork is an original SVG with a rendered PNG. Canvas and CSS graphics are original geometry, not screenshots of client products. Motion respects reduced-motion, hidden-document and offscreen states.
