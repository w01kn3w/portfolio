# React portfolio rebuild

## Scope and truth

Replace the static portfolio with React, TypeScript and Vite in a separate worktree and reviewable pull request. Russian is the primary language. Use the owner's supplied public identity and contact in `src/content.ts`. The portfolio itself is the sole verified project. Future work appears as a clearly labelled empty state, never fictional case studies or credentials.

## Direction contract

THESIS: A personal digital sketchbook in motion. A large name and a living line sculpture make this an experience rather than a résumé template.

OWN-WORLD: Persimmon orange, almost-black ink, cool light-gray paper. Self-hosted Manrope. Open asymmetric layouts, solid fields, fine rules and rounded-square controls. No stock portraits, fabricated metrics or decorative cards.

STORY: Meet the owner, explore an interactive visual experiment, inspect the real portfolio source, then send an email. The project archive is ready to grow through a typed content file.

FIRST VIEWPORT: A compact masthead, an enormous name on orange, then a split composition: a concise introduction and project link at left, a pointer-responsive canvas line sculpture at right. A pause control makes the visual optional. On phones the sculpture sits below the introduction.

FORM: Code-led editorial canvas, selected under the user's explicit delegation of all creative choices. No generated raster assets or approved image comp.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Architecture and acceptance

- `src/content.ts`: identity, links and typed project records; adding a published project requires no component changes.
- `src/Orbit.tsx`: bounded canvas drawing, fine-pointer response, pause, reduced motion, visibility and intersection handling, resize cleanup.
- `src/App.tsx`: semantic navigation, work archive, about and contact. No form backend or tracking.
- `src/styles.css`: responsive composition, keyboard focus, reduced motion and touch behavior.
- Vite base `/portfolio/`; all runtime assets bundled locally.
- CI checks lint, TypeScript and production build. Deployment runs on main pushes with a manual rerun and is explicitly gated on main. Existing legacy Pages stays untouched during review. After approval, switch Pages source to Actions BEFORE merging, preventing a legacy root build from publishing raw TSX; merge then deploys the built artifact.
- Verify desktop and genuine mobile viewport, keyboard navigation, overflow, canvas pause, reduced motion, browser errors, and built asset loading.

## Review boundaries

Do not merge this PR, change Pages settings, or replace the live site before review. The original checkout remains on main. Local screenshots are review evidence rather than shipping artwork.
