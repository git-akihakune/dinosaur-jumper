# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server with HMR
npm run build        # typecheck (tsc) then production build → dist/
npm run preview      # serve the production build locally
```

No tests or linting configured.

## Architecture

Deceptive Chrome dino clone that evolves into a retro platformer using **Phaser 3 + TypeScript + Vite**.

- `src/main.ts` — Phaser game config (800×300 canvas, single scene)
- `src/config/constants.ts` — all tunable game constants and score thresholds
- `src/scenes/GameScene.ts` — main scene orchestrating all systems
- `src/systems/PhaseManager.ts` — score-based evolution event emitter
- `src/systems/InputManager.ts` — keyboard + touch input with progressive unlocks
- `src/systems/Physics.ts` — AABB collision detection
- `src/systems/AutoPlayAI.ts` — look-ahead AI for auto-play
- `src/entities/` — Dino, Obstacle, Platform, Collectible, PowerUp
- `src/graphics/TextureGen.ts` — procedural pixel-art sprite generation
- `src/ui/ChromeOverlay.ts` — fake Chrome error page DOM overlay
- `src/ui/HUD.ts` — score display, power-up indicators
- `src/ui/GameOverScreen.ts` — game over / restart screen

### Game Evolution

Score thresholds in `constants.ts` control when new elements appear:
- 0-200: Classic Chrome dino (monochrome)
- 200-1000: Color evolves, Chrome overlay fades, parallax appears
- 600+: Platforms
- 1200+: Collectibles
- 1500+: Power-ups (shield, magnet, auto-play)
- 2000+: Lane system
- 2500+: Permanent auto-play unlock

PWA-enabled with offline support. All sprites procedurally generated (no external assets).
