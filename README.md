# Personal portfolio

React + TypeScript + Vite. Russian copy, local fonts, interactive canvas, and a growing project archive.

## Local development

Use Node.js 24 and npm. On PowerShell installations that block npm.ps1, use npm.cmd.

```sh
npm ci
npm run dev
npm run check
npm run preview
```

The app runs under `/portfolio/`, including during local preview. `npm run check` runs ESLint, TypeScript, and the production build.

## Publish a project

Edit `src/content.ts`. The identity and contact settings live there too. Add a project record with a unique slug, factual title and description, year, category, technologies, and source URL. An optional live URL adds a second link. Use `preview: 'portfolio'` only for this portfolio; other projects receive a neutral title/technology preview. There are no sample client projects or fabricated case studies.

## Review and deployment

Do not merge or change the live site until review is complete. This branch leaves GitHub Pages settings untouched. CI validates pull requests; the deploy workflow runs on main pushes and supports manual reruns.

After approval, **before merging**, change repository Settings → Pages → Build and deployment → Source to **GitHub Actions**. This retains the existing published site while preventing the legacy root-source builder from publishing the Vite source HTML at merge. Merge the reviewed pull request; **Deploy portfolio after review** runs automatically. Use its manual Actions trigger against main to retry if needed. The workflow builds `dist` and deploys that artifact. Do not run a root-source Pages build for the React code: the browser cannot execute TSX source. Changing the repository name also requires updating `base` in `vite.config.ts`.

No contact service, API key, analytics or remote font request is required. Email links open the visitor's email app; the clipboard control reports success or an actionable fallback.

## Design and review

See `REBUILD.md` for requirements and direction, `DESIGN.md` for actual visual tokens, and `.impeccable/design.json` for the design sidecar. Local viewport evidence is stored in the ignored `.impeccable/review/` directory.

Fonts are self-hosted under `assets/`; their license files remain beside them.
