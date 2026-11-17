# Low-poly RPG — environment prototype

## Requirements
- Node.js 20.19+ or 22.12+
- npm

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

The production output is written to `dist/`. Netlify settings are included in `netlify.toml`.

## Current architecture
- `src/core/createGame.js` — creates the Three.js scene, camera, renderer, lights and render loop.
- `src/world/island.js` — island and sea geometry.
- `src/world/environment.js` — procedural placement of trees and rocks; returns obstacle metadata for future collision logic.
- `src/utils/` — small reusable helpers.

The environment uses a seeded random generator. Change `seed` in `createGame.js` to get a different but repeatable layout.
