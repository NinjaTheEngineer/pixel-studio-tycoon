# Pixel Studio Tycoon

A browser-based idle game-development tycoon. Start with a tiny solo project, build a team and release pipeline, then grow toward a much larger studio.

## Play

<https://ninjatheengineer.github.io/pixel-studio-tycoon/>

## Version 0.2

- Three projects with different work and reward profiles
- Active coding taps that build Focus and multiply all production
- Developer Tools, Development Team, and Release Pipeline upgrade paths
- Fully automatic publishing after the pipeline is unlocked
- A configurable three-slot project queue
- Versioned local saves, v1 migration, and offline progress
- Responsive desktop and mobile interface
- Pure economy engine covered by automated tests

Focus is deliberately a studio-wide multiplier instead of a simple click bonus. This keeps tapping valuable after automation is unlocked without making it mandatory.

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
