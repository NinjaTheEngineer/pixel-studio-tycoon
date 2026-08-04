# Pixel Studio Tycoon

A browser-based idle game-development tycoon. Start with a tiny solo project, build a team and release pipeline, then grow toward a much larger studio.

## Play

<https://ninjatheengineer.github.io/pixel-studio-tycoon/>

## Version 0.4

- Unique generated titles for every release
- Five visible development phases: concept, pre-production, production, polish, and launch preparation
- A slower early-game economy built around a solo developer
- One Work button that becomes Publish when development is complete
- Phase-specific upgrades instead of a global Focus multiplier
- 1,000 work for the first game, completed through roughly 100 basic work actions
- Team hiring after game 3 and release automation after game 8
- Three project types with different work and reward profiles
- Manual Work advances the current phase; phase upgrades improve only the relevant activity
- Design Reference Library, Prototype Toolkit, Home Workstation, Playtest Circle, Store Page Kit, Development Team, and Release Pipeline upgrades
- Fully automatic publishing after the pipeline is unlocked
- A configurable three-slot project queue
- Versioned local saves, v1 migration, and offline progress
- Responsive desktop and mobile interface
- Pure economy engine covered by 37 active mechanics tests, with 12 explicit v0.5 contracts pending

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

- Tune the first 15â€“20 minutes from playtest data
- Add visible studio-room growth and stronger feedback
- Add milestones and the first prestige prototype
- Expand projects, staff roles, and strategic genre choices

Ads and commercial platform wrappers are intentionally deferred until the core economy is fun and stable.
