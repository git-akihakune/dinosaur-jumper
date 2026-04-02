# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server with HMR
npm run build        # typecheck (tsc) then production build → dist/
npm run preview      # serve the production build locally
```

There are no tests or linting configured.

## Architecture

Chrome dinosaur game clone using **Phaser 3 + TypeScript + Vite**.

- `src/main.ts` — Phaser game config (800×300 canvas, single scene)
- `src/scenes/GameScene.ts` — all game logic in one scene class:
  - **Pixel-art textures** generated programmatically via Phaser Graphics API (no external assets)
  - **Obstacles**: cacti (sm/md/lg) and birds (lo/hi) with AABB collision detection
  - **Auto-play AI**: look-ahead algorithm that calculates time-to-obstacle and jumps within a reaction threshold (`AUTOPLAY_REACT_MS`). Toggle with **A** key.
  - Game constants (speed, gravity, jump velocity, gaps) are at the top of the file

The game is entirely client-side with no backend. Build output is a static `dist/` folder.
