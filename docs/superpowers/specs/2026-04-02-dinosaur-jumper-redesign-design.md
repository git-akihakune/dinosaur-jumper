# Dinosaur Jumper — Redesign Spec

## Overview

A deceptive browser game that starts as a pixel-perfect Chrome "no internet" dinosaur game clone, then continuously evolves into a full-featured retro platformer/endless runner. The page itself mimics the Chrome error screen, completing the illusion. As the player's score rises, new mechanics, visuals, and UI elements are introduced seamlessly — fooling players into thinking they're playing the standard browser game before surprising them.

**Tech stack:** Phaser 3, TypeScript, Vite, PWA-ready.

## Core Concept: The Deception

1. **The page** loads as a convincing Chrome "no internet" error page (error icon, "Try" button area, gray background).
2. **The game** starts exactly like Chrome's dino — monochrome pixel art, simple jump-over-cacti mechanics.
3. **As the score rises**, new elements appear one at a time: color, platforms, enemies, collectibles, power-ups, lanes. The Chrome error page overlay fades away gradually.
4. **By score ~1000**, the page has transformed into a proper retro game site with full-color visuals and an evolved HUD.

## Game Evolution Timeline

Elements are introduced continuously at tunable score thresholds (no hard phase boundaries):

| Score | New Element | Visual Change |
|-------|-------------|---------------|
| 0 | Classic runner: cacti, ground, clouds | Monochrome, faithful Chrome dino clone |
| ~200 | Ground texture gets subtle color tint | First hint of change |
| ~400 | Sky gradient, clouds get color | Chrome error page text begins fading |
| ~600 | Elevated platforms appear | Dino can jump onto platforms |
| ~800 | Patterned flying enemies | Parallax background layers appear |
| ~1000 | Full color saturation | Chrome overlay fully gone, game title appears |
| ~1200 | Collectible coins/gems | Score UI evolves into styled HUD |
| ~1500 | Power-ups spawn (shield, magnet, auto-play) | Power-up indicator in HUD |
| ~2000 | Multiple lanes | Lane-switch controls activate |
| ~2500+ | Boss-like patterns, speed cap | Full retro aesthetic, auto-play mode unlockable |

All thresholds are constants in a single config file for easy tuning.

## Architecture

**Approach:** Single Phaser scene with a PhaseManager and modular entity types.

### File Structure

```
dinosaur-jumper/
├── index.html                  # Fake Chrome error page + canvas container
├── manifest.json               # PWA manifest
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.ts                 # Phaser config, boot
│   ├── scenes/
│   │   └── GameScene.ts        # Main scene, orchestrates systems and entities
│   ├── systems/
│   │   ├── PhaseManager.ts     # Score-based evolution controller (event emitter)
│   │   ├── Physics.ts          # Gravity, AABB collision detection
│   │   └── InputManager.ts     # Keyboard + touch, evolves with unlocks
│   ├── entities/
│   │   ├── Dino.ts             # Player: animations, states (run/jump/duck/dead)
│   │   ├── Obstacle.ts         # Cacti and birds (base obstacles)
│   │   ├── Platform.ts         # Elevated platforms (unlocked ~600)
│   │   ├── Collectible.ts      # Coins, gems (unlocked ~1200)
│   │   └── PowerUp.ts          # Shield, magnet, auto-play (unlocked ~1500)
│   ├── ui/
│   │   ├── ChromeOverlay.ts    # DOM-based fake Chrome error page, fades out
│   │   ├── HUD.ts              # Score, hi-score, power-up indicators
│   │   └── GameOverScreen.ts   # Restart prompt, evolves with phases
│   ├── graphics/
│   │   └── TextureGen.ts       # Procedural pixel-art sprite generation
│   └── config/
│       └── constants.ts        # All game constants, thresholds, physics values
```

### Key Systems

**PhaseManager** — The brain of the evolution system:
- Watches the current score continuously
- Emits events when thresholds are crossed: `"unlock:color"`, `"unlock:platforms"`, `"unlock:powerups"`, `"unlock:lanes"`, etc.
- Other systems subscribe to these events and activate/deactivate features
- Tracks which features have been unlocked (persisted in localStorage for the auto-play unlock)

**ChromeOverlay** — DOM-based fake Chrome error page:
- Built with standard HTML/CSS overlaying the Phaser canvas
- Mimics Chrome's "no internet" page: error icon, message text, gray styling
- Responsive — works on mobile screens
- Listens to PhaseManager events and fades out elements gradually (opacity transitions)
- Fully removed from DOM by score ~1000

**TextureGen** — Procedural sprite generation:
- All sprites are generated via Phaser's Graphics API (no external asset files)
- Initial textures are monochrome (matching Chrome dino)
- PhaseManager triggers palette shifts — TextureGen regenerates textures with color
- Sprite types: dino (run/duck/dead frames), cacti (sm/md/lg), birds, platforms, coins, power-ups

**InputManager** — Progressive input:
- **Always available:** Space/Up = jump, Down = duck
- **Touch (always):** Tap = jump, swipe down = duck
- **Unlocked ~2000:** Up/Down arrows and swipe up/down become lane switching (replaces simple jump/duck)
- **Unlocked ~2500:** Auto-play mode toggle
- Prevents default touch behaviors on canvas (pull-to-refresh, scroll bounce)

**Physics** — Simple and custom:
- Gravity, velocity, ground collision
- AABB collision detection with per-entity hitboxes
- Platform landing detection (one-way platforms — can jump through from below)

### Entity Details

**Dino (player):**
- States: idle, running, jumping, ducking, dead
- Animation frames: 2 run frames, 2 duck frames, 1 dead frame
- Fixed x-position (~80px from left), moves vertically
- Hitbox shrinks when ducking

**Obstacles:**
- Cacti: small (24x50), medium (40x60), large (52x70) — ground-level
- Birds: low (must duck) and high (can run under) — 50x30 with wing flap
- Spawn rate and variety increase with score
- Bird probability increases with speed (0% at start, up to 35%)

**Platforms (unlocked ~600):**
- Elevated ground segments the dino can jump onto
- One-way collision (pass through from below, land on top)
- Can have obstacles or collectibles on them
- Procedurally placed with guaranteed reachability

**Collectibles (unlocked ~1200):**
- Coins/gems placed along the path and on platforms
- Contribute to score bonus
- Magnet power-up attracts nearby collectibles

**Power-ups (unlocked ~1500):**
- **Shield:** Absorbs one hit, visual indicator around dino
- **Magnet:** Attracts collectibles within radius for ~8 seconds
- **Auto-play (temporary):** AI controls the dino for ~10 seconds
- Spawn as distinct sprites on the ground/platforms
- HUD shows active power-up with duration indicator

**Lanes (unlocked ~2000):**
- 3 vertical lanes (top, middle, bottom) at different y-positions
- Dino switches lanes with Up/Down arrows or swipe up/down gestures (replaces simple duck at this phase)
- Obstacles and collectibles appear in specific lanes
- Adds strategic depth to the late game — ducking becomes lane-down, jumping becomes lane-up

## Auto-play System

**Dual implementation:**
1. **Temporary power-up** — collectible during gameplay (~1500+ score), AI controls dino for ~10 seconds. Available every run.
2. **Permanent mode** — unlocked after reaching score 2500+ in a single run. Persisted in localStorage. Once unlocked, a toggle appears in the HUD. AI handles all unlocked mechanics (jumping, ducking, platforms, lane switching, power-up collection).

**AI algorithm:** Look-ahead based — scans upcoming obstacles, calculates time-to-collision, acts within a reaction threshold. Threshold decreases slightly with score to keep it impressive but not perfect.

## Mobile Support

- **Responsive canvas:** Phaser `Scale.FIT` + `CENTER_BOTH` — fills viewport while maintaining aspect ratio
- **Touch controls:** Tap = jump, swipe down = duck. When lanes unlock (~2000): swipe up/down = lane switch
- **Touch prevention:** `touch-action: none` on canvas, prevent default on touch events to block pull-to-refresh and scroll bounce
- **Viewport:** `<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">`
- **Chrome overlay responsive:** Error page layout stacks properly on small screens via CSS media queries
- **Orientation:** Works in both portrait and landscape; landscape recommended via a subtle prompt if in portrait

## PWA Support

- **manifest.json:** App name "Dinosaur Jumper", icons (generated programmatically or simple pixel-art PNGs), `display: fullscreen`, `theme_color` matching Chrome gray
- **Service worker:** Cache the JS bundle and index.html for full offline play. Use `vite-plugin-pwa` for generation.
- **Install prompt:** Subtly offered on the game-over screen after a few plays
- **Offline-first:** All sprites are procedurally generated, no external assets to cache — the app is naturally tiny

## SEO — Basic Meta Tags

```html
<title>Dinosaur Jumper — The Browser Game That Evolves</title>
<meta name="description" content="Think you know the Chrome dinosaur game? Think again. Play the browser game that transforms as you play.">
<meta name="theme-color" content="#f7f7f7">
<meta property="og:title" content="Dinosaur Jumper">
<meta property="og:description" content="The Chrome dino game... or is it? Play and find out.">
<meta property="og:type" content="website">
<meta property="og:image" content="/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="...">
```

- `og-image.png`: A designed preview image showing the game mid-evolution (half monochrome, half color)
- `<noscript>` fallback message
- `aria-label` on canvas element
- Semantic HTML structure in the Chrome overlay (headings, paragraphs)

## Score & Persistence

- **Current score:** Time-based, scaled by speed. Displayed top-right.
- **Hi-score:** Persisted in localStorage. Shown alongside current score.
- **Auto-play unlock:** Persisted in localStorage (boolean flag).
- **No server-side persistence** — fully client-side.

## Verification Plan

1. **Build & run:** `npm run dev` — game loads, Chrome error page appears
2. **Phase 0 test:** Game plays exactly like Chrome dino — monochrome, cacti, jump/duck
3. **Evolution test:** Play through score thresholds, verify each element appears at the right time
4. **Chrome overlay test:** Verify error page fades out smoothly between 0–1000
5. **Mobile test:** Open on phone/tablet — touch controls work, responsive layout, no scroll issues
6. **PWA test:** Install as PWA, verify offline play works
7. **SEO test:** Check meta tags render in social share previews (use ogp debugger or Twitter card validator)
8. **Auto-play test:** Reach 2500, verify mode unlocks and persists across sessions
9. **Production build:** `npm run build` — verify dist/ output is clean and works via `npm run preview`
