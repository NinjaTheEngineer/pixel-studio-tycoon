# Pixel Studio Tycoon

A browser-based idle game-development tycoon. Start with a tiny solo project, build a team and release pipeline, then grow toward a much larger studio.

## Play

<https://ninjatheengineer.github.io/pixel-studio-tycoon/>

## Version 0.9

- Unique generated titles for every release
- Three brainstormed concepts before every project: safe, promising, and wild
- Visible potential, scope, and workload tradeoffs; Risk is hidden until it has a real consequence
- Fixed company stages with 3 Bedroom releases, 5 Small Indie releases, and a larger Established Studio family
- Workload grows 18% with every release inside a stage
- First-run tutorial plus a permanent How to Play guide
- Phase milestone funding before the final release payment
- Large central Cookie Clicker-style Work/Publish control
- Increasing milestone complexity across the first three releases
- Five visible development phases: concept, pre-production, production, polish, and launch preparation
- A slower early-game economy built around a solo developer
- The computer itself is the Work surface: taps begin at +1, float their value, shake the PC, and publish when development is complete
- Rare Patrons provide recurring cash; the Patron Community Page increases their contribution
- Phone-first single-screen layout with Work, Upgrades, and Projects tabs
- Commercial-friendly Lucide SVG icon system under the ISC license
- Phase-specific upgrades instead of a global Focus multiplier
- 100 work for the first balanced game, completed through roughly 100 basic work actions
- A free first-teammate milestone after game 3 with Game Designer, Programmer, and 2D Artist specialties
- Phase-specific teammate automation, visible DUO studio growth, and Shared Studio Desks scaling
- Release automation after game 8
- Three project types with different work and reward profiles
- Manual Work advances the current phase; phase upgrades improve only the relevant activity
- Design Reference Library, Prototype Toolkit, Home Workstation, Playtest Circle, Store Page Kit, Shared Studio Desks, and Release Pipeline upgrades
- Fully automatic publishing after the pipeline is unlocked
- A configurable three-slot project queue
- Versioned local saves, v1/v2 migration, and offline progress
- Responsive desktop and mobile interface
- Economy and UI-model logic covered by 54 active tests, with 11 future contracts pending

Each solo upgrade improves the development phase it logically supports. Staff is delayed until the player has shipped three solo games so hiring feels like a meaningful studio milestone.

## Develop locally

Requirements: Node.js 24 and pnpm 10 or newer.

```bash
pnpm install
pnpm dev
```

Validation and production build:

```bash
pnpm test
pnpm build
```

GitHub Actions runs both commands and deploys `dist/` to GitHub Pages on every push to `main`.

## Next milestone

- Tune the first 15–20 minutes from playtest data
- Expand the DUO studio into clearer staff management and additional roles
- Add milestones and the first prestige prototype
- Expand projects, staff roles, and strategic genre choices

Ads and commercial platform wrappers are intentionally deferred until the core economy is fun and stable.
