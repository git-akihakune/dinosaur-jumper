# Dinosaur Jumper

A Chrome dinosaur game clone built with **Phaser 3** and **TypeScript**, featuring an **auto-play mode** that drives the dinosaur by itself.

## Features

- Classic side-scrolling dino runner gameplay (cacti, pterodactyls, accelerating speed)
- Pixel-art graphics drawn entirely with Phaser's Graphics API — no external assets required
- **Auto-play mode**: an AI agent that detects upcoming obstacles and jumps at the right time
- Score counter and personal best tracking (session)
- Fully static — just build and serve the `dist/` folder

## Getting Started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Auto-play

Toggle auto-play with the **A** key or the on-screen button. The AI uses a
look-ahead algorithm: it projects the time until the nearest obstacle reaches
the dinosaur and triggers a jump when that window is smaller than a
speed-adjusted reaction threshold.

## Tech Stack

- [Phaser 3](https://phaser.io/) — HTML5 game framework
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tooling & dev server
