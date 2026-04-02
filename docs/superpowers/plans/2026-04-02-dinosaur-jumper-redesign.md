# Dinosaur Jumper Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deceptive browser game that starts as a Chrome "no internet" dino clone and continuously evolves into a retro platformer/endless runner as score increases.

**Architecture:** Single Phaser 3 scene with a PhaseManager event emitter that watches the score and progressively unlocks new gameplay elements, visuals, and controls. A DOM-based Chrome error page overlay fades out as the game evolves. All sprites are procedurally generated.

**Tech Stack:** Phaser 3, TypeScript, Vite, vite-plugin-pwa

**Spec:** `docs/superpowers/specs/2026-04-02-dinosaur-jumper-redesign-design.md`

---

## File Map

| File | Responsibility |
|------|---------------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript strict config |
| `vite.config.ts` | Vite + PWA plugin config |
| `index.html` | Fake Chrome error page, canvas container, SEO meta tags |
| `manifest.json` | PWA manifest |
| `src/main.ts` | Phaser game config and boot |
| `src/config/constants.ts` | All tunable game constants and score thresholds |
| `src/graphics/TextureGen.ts` | Procedural pixel-art sprite generation |
| `src/entities/Dino.ts` | Player character: states, animation, hitbox |
| `src/entities/Obstacle.ts` | Cacti and birds |
| `src/entities/Platform.ts` | Elevated platforms |
| `src/entities/Collectible.ts` | Coins and gems |
| `src/entities/PowerUp.ts` | Shield, magnet, auto-play power-ups |
| `src/systems/PhaseManager.ts` | Score-based evolution event emitter |
| `src/systems/Physics.ts` | Gravity, AABB collision, platform landing |
| `src/systems/InputManager.ts` | Keyboard + touch input, progressive unlocks |
| `src/systems/AutoPlayAI.ts` | AI look-ahead algorithm for auto-play |
| `src/ui/ChromeOverlay.ts` | DOM fake Chrome error page, fade-out |
| `src/ui/HUD.ts` | Score display, hi-score, power-up indicators |
| `src/ui/GameOverScreen.ts` | Game over / restart prompt |
| `src/scenes/GameScene.ts` | Main scene: orchestrates all systems and entities |

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "dinosaur-jumper",
  "version": "2.0.0",
  "description": "A deceptive browser game — starts as Chrome dino, evolves into a retro platformer",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "vite": "^5.2.10",
    "vite-plugin-pwa": "^0.21.1"
  },
  "dependencies": {
    "phaser": "^3.88.2"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitOverride": true,
    "outDir": "dist",
    "sourceMap": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create vite.config.ts** (PWA plugin added later in Task 14)

```typescript
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
```

- [ ] **Step 4: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, `package-lock.json` generated

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts
git commit -m "feat: scaffold project with Phaser 3, TypeScript, Vite"
```

---

## Task 2: Game Constants

**Files:**
- Create: `src/config/constants.ts`

- [ ] **Step 1: Create constants file**

This file holds ALL tunable values. Every magic number in the game lives here.

```typescript
// Canvas
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 300;
export const GROUND_Y = 240;

// Dino
export const DINO_X = 80;
export const DINO_WIDTH = 44;
export const DINO_HEIGHT = 48;
export const DINO_DUCK_HEIGHT = 30;

// Physics
export const GRAVITY = 2200;
export const JUMP_VELOCITY = -680;
export const INITIAL_SPEED = 350;
export const MAX_SPEED = 1200;
export const SPEED_ACCEL = 8; // px/s per second

// Obstacles
export const MIN_OBSTACLE_GAP = 350;
export const MAX_OBSTACLE_GAP = 700;
export const CACTUS_SM = { width: 24, height: 50 };
export const CACTUS_MD = { width: 40, height: 60 };
export const CACTUS_LG = { width: 52, height: 70 };
export const BIRD_SIZE = { width: 50, height: 30 };
export const MAX_BIRD_PROBABILITY = 0.35;

// Score thresholds for evolution
export const THRESHOLD_COLOR_TINT = 200;
export const THRESHOLD_SKY_COLOR = 400;
export const THRESHOLD_PLATFORMS = 600;
export const THRESHOLD_FLYING_ENEMIES = 800;
export const THRESHOLD_FULL_COLOR = 1000;
export const THRESHOLD_COLLECTIBLES = 1200;
export const THRESHOLD_POWERUPS = 1500;
export const THRESHOLD_LANES = 2000;
export const THRESHOLD_BOSS_PATTERNS = 2500;

// Auto-play
export const AUTOPLAY_REACT_MS = 310;
export const AUTOPLAY_POWERUP_DURATION = 10000; // ms
export const AUTOPLAY_UNLOCK_SCORE = 2500;

// Power-ups
export const SHIELD_DURATION = 0; // lasts until hit
export const MAGNET_DURATION = 8000;
export const MAGNET_RADIUS = 120;

// Lanes
export const LANE_COUNT = 3;
export const LANE_POSITIONS = [160, 200, 240]; // y positions: top, mid, bottom

// Clouds
export const CLOUD_MIN_Y = 40;
export const CLOUD_MAX_Y = 120;
export const CLOUD_SPEED_FACTOR = 0.3;

// Colors
export const MONO_COLOR = 0x535353;
export const MONO_BG = 0xf7f7f7;

// Platform
export const PLATFORM_WIDTH = 100;
export const PLATFORM_HEIGHT = 16;
```

- [ ] **Step 2: Commit**

```bash
git add src/config/constants.ts
git commit -m "feat: add game constants and score thresholds"
```

---

## Task 3: Minimal index.html and main.ts

**Files:**
- Create: `index.html`, `src/main.ts`

- [ ] **Step 1: Create index.html** (minimal — Chrome overlay added later)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <title>Dinosaur Jumper</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        background: #f7f7f7;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        overflow: hidden;
        touch-action: none;
      }
      canvas { display: block; }
    </style>
  </head>
  <body>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 2: Create src/main.ts**

```typescript
import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./config/constants";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: "#f7f7f7",
  scene: [GameScene],
  parent: document.body,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
```

- [ ] **Step 3: Create a stub GameScene** so the project boots

Create `src/scenes/GameScene.ts`:

```typescript
import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    this.add.text(200, 130, "Dinosaur Jumper", {
      fontSize: "32px",
      color: "#535353",
    });
  }
}
```

- [ ] **Step 4: Verify**

Run: `npm run dev`
Expected: Browser shows gray page with "Dinosaur Jumper" text centered in an 800x300 canvas.

- [ ] **Step 5: Commit**

```bash
git add index.html src/main.ts src/scenes/GameScene.ts
git commit -m "feat: minimal Phaser boot with stub GameScene"
```

---

## Task 4: Procedural Texture Generation

**Files:**
- Create: `src/graphics/TextureGen.ts`

- [ ] **Step 1: Create TextureGen**

This generates all game sprites procedurally using the Phaser Graphics API. Initially monochrome. The `regenerateWithColor` method will be called later by PhaseManager.

```typescript
import Phaser from "phaser";
import {
  DINO_WIDTH, DINO_HEIGHT, DINO_DUCK_HEIGHT,
  CACTUS_SM, CACTUS_MD, CACTUS_LG, BIRD_SIZE,
  PLATFORM_WIDTH, PLATFORM_HEIGHT,
  MONO_COLOR,
} from "../config/constants";

export class TextureGen {
  private scene: Phaser.Scene;
  private color: number = MONO_COLOR;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  generate(): void {
    this.generateDino();
    this.generateCacti();
    this.generateBird();
    this.generateGround();
    this.generateCloud();
  }

  setColor(color: number): void {
    this.color = color;
  }

  private generateDino(): void {
    const c = this.color;
    // Run frame 1
    this.drawTexture("dino-run1", DINO_WIDTH, DINO_HEIGHT, (g) => {
      g.fillStyle(c);
      // Body
      g.fillRect(8, 0, 28, 32);
      // Head
      g.fillRect(20, 0, 24, 20);
      // Eye (cutout)
      g.fillStyle(0xffffff);
      g.fillRect(34, 4, 6, 6);
      g.fillStyle(c);
      // Legs - frame 1: left forward, right back
      g.fillRect(12, 32, 8, 16);
      g.fillRect(28, 32, 8, 12);
      // Tail
      g.fillRect(0, 8, 10, 8);
      // Arms
      g.fillRect(24, 22, 6, 10);
    });

    // Run frame 2
    this.drawTexture("dino-run2", DINO_WIDTH, DINO_HEIGHT, (g) => {
      g.fillStyle(c);
      g.fillRect(8, 0, 28, 32);
      g.fillRect(20, 0, 24, 20);
      g.fillStyle(0xffffff);
      g.fillRect(34, 4, 6, 6);
      g.fillStyle(c);
      // Legs - frame 2: right forward, left back
      g.fillRect(12, 32, 8, 12);
      g.fillRect(28, 32, 8, 16);
      g.fillRect(0, 8, 10, 8);
      g.fillRect(24, 22, 6, 10);
    });

    // Duck frame 1
    this.drawTexture("dino-duck1", DINO_WIDTH + 10, DINO_DUCK_HEIGHT, (g) => {
      g.fillStyle(c);
      g.fillRect(0, 0, 54, 20);
      g.fillRect(36, 0, 18, 14);
      g.fillStyle(0xffffff);
      g.fillRect(46, 2, 4, 4);
      g.fillStyle(c);
      g.fillRect(10, 20, 8, 10);
      g.fillRect(26, 20, 8, 6);
    });

    // Duck frame 2
    this.drawTexture("dino-duck2", DINO_WIDTH + 10, DINO_DUCK_HEIGHT, (g) => {
      g.fillStyle(c);
      g.fillRect(0, 0, 54, 20);
      g.fillRect(36, 0, 18, 14);
      g.fillStyle(0xffffff);
      g.fillRect(46, 2, 4, 4);
      g.fillStyle(c);
      g.fillRect(10, 20, 8, 6);
      g.fillRect(26, 20, 8, 10);
    });

    // Dead
    this.drawTexture("dino-dead", DINO_WIDTH, DINO_HEIGHT, (g) => {
      g.fillStyle(c);
      g.fillRect(8, 0, 28, 32);
      g.fillRect(20, 0, 24, 20);
      // X eyes
      g.fillStyle(0xffffff);
      g.fillRect(34, 4, 6, 6);
      g.fillStyle(c);
      g.fillRect(35, 5, 2, 2);
      g.fillRect(37, 7, 2, 2);
      g.fillRect(12, 32, 8, 14);
      g.fillRect(28, 32, 8, 14);
      g.fillRect(0, 8, 10, 8);
      g.fillRect(24, 22, 6, 10);
    });
  }

  private generateCacti(): void {
    const c = this.color;
    this.drawTexture("cactus-sm", CACTUS_SM.width, CACTUS_SM.height, (g) => {
      g.fillStyle(c);
      g.fillRect(8, 0, 8, 50);
      g.fillRect(0, 12, 8, 8);
      g.fillRect(16, 20, 8, 8);
    });

    this.drawTexture("cactus-md", CACTUS_MD.width, CACTUS_MD.height, (g) => {
      g.fillStyle(c);
      g.fillRect(14, 0, 12, 60);
      g.fillRect(0, 10, 14, 10);
      g.fillRect(0, 10, 8, 24);
      g.fillRect(26, 18, 14, 10);
      g.fillRect(32, 18, 8, 26);
    });

    this.drawTexture("cactus-lg", CACTUS_LG.width, CACTUS_LG.height, (g) => {
      g.fillStyle(c);
      g.fillRect(18, 0, 16, 70);
      g.fillRect(0, 14, 18, 10);
      g.fillRect(0, 14, 10, 30);
      g.fillRect(34, 22, 18, 10);
      g.fillRect(42, 22, 10, 32);
    });
  }

  private generateBird(): void {
    const c = this.color;
    // Wing up
    this.drawTexture("bird1", BIRD_SIZE.width, BIRD_SIZE.height, (g) => {
      g.fillStyle(c);
      g.fillRect(0, 14, 50, 6);
      g.fillRect(10, 4, 8, 10);
      g.fillRect(18, 0, 8, 14);
    });

    // Wing down
    this.drawTexture("bird2", BIRD_SIZE.width, BIRD_SIZE.height, (g) => {
      g.fillStyle(c);
      g.fillRect(0, 8, 50, 6);
      g.fillRect(10, 14, 8, 10);
      g.fillRect(18, 14, 8, 16);
    });
  }

  private generateGround(): void {
    this.drawTexture("ground", 2400, 4, (g) => {
      g.fillStyle(this.color);
      g.fillRect(0, 0, 2400, 2);
      // Pebbles
      for (let x = 0; x < 2400; x += Phaser.Math.Between(8, 30)) {
        const w = Phaser.Math.Between(1, 4);
        g.fillRect(x, Phaser.Math.Between(2, 3), w, 1);
      }
    });
  }

  private generateCloud(): void {
    this.drawTexture("cloud", 60, 20, (g) => {
      g.fillStyle(this.color, 0.3);
      g.fillRect(10, 6, 40, 8);
      g.fillRect(16, 2, 28, 4);
      g.fillRect(20, 14, 20, 4);
    });
  }

  generatePlatform(): void {
    this.drawTexture("platform", PLATFORM_WIDTH, PLATFORM_HEIGHT, (g) => {
      g.fillStyle(this.color);
      g.fillRect(0, 0, PLATFORM_WIDTH, 4);
      // Support pillars
      g.fillRect(4, 4, 4, PLATFORM_HEIGHT - 4);
      g.fillRect(PLATFORM_WIDTH - 8, 4, 4, PLATFORM_HEIGHT - 4);
      // Cross brace
      g.fillRect(0, PLATFORM_HEIGHT - 2, PLATFORM_WIDTH, 2);
    });
  }

  generateCollectible(): void {
    this.drawTexture("coin", 16, 16, (g) => {
      g.fillStyle(0xffd700);
      g.fillRect(4, 0, 8, 16);
      g.fillRect(0, 4, 16, 8);
      g.fillStyle(0xffec80);
      g.fillRect(6, 4, 4, 8);
    });
  }

  generatePowerUps(): void {
    // Shield
    this.drawTexture("powerup-shield", 20, 20, (g) => {
      g.fillStyle(0x4488ff);
      g.fillRect(4, 0, 12, 4);
      g.fillRect(0, 4, 20, 8);
      g.fillRect(2, 12, 16, 4);
      g.fillRect(6, 16, 8, 4);
    });

    // Magnet
    this.drawTexture("powerup-magnet", 20, 20, (g) => {
      g.fillStyle(0xff4444);
      g.fillRect(2, 0, 6, 14);
      g.fillRect(12, 0, 6, 14);
      g.fillStyle(0x888888);
      g.fillRect(0, 14, 10, 6);
      g.fillRect(10, 14, 10, 6);
    });

    // Auto-play
    this.drawTexture("powerup-autoplay", 20, 20, (g) => {
      g.fillStyle(0x44ff44);
      g.fillRect(4, 2, 4, 16);
      g.fillRect(8, 4, 4, 12);
      g.fillRect(12, 6, 4, 8);
    });
  }

  private drawTexture(
    key: string,
    width: number,
    height: number,
    draw: (g: Phaser.GameObjects.Graphics) => void
  ): void {
    // Remove existing texture if regenerating
    if (this.scene.textures.exists(key)) {
      this.scene.textures.remove(key);
    }
    const g = this.scene.add.graphics();
    draw(g);
    g.generateTexture(key, width, height);
    g.destroy();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/graphics/TextureGen.ts
git commit -m "feat: procedural pixel-art texture generation"
```

---

## Task 5: Dino Entity

**Files:**
- Create: `src/entities/Dino.ts`

- [ ] **Step 1: Create Dino entity**

```typescript
import Phaser from "phaser";
import {
  DINO_X, DINO_WIDTH, DINO_HEIGHT, DINO_DUCK_HEIGHT,
  GROUND_Y, GRAVITY, JUMP_VELOCITY,
} from "../config/constants";

export type DinoState = "idle" | "running" | "jumping" | "ducking" | "dead";

export class Dino {
  sprite: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;

  state: DinoState = "idle";
  velocityY = 0;
  isOnGround = true;

  // Animation timer
  private animTimer = 0;
  private animFrame = 0;
  private readonly ANIM_INTERVAL = 100; // ms between frames

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.sprite = scene.add.sprite(DINO_X, GROUND_Y - DINO_HEIGHT, "dino-run1");
    this.sprite.setOrigin(0, 0);
  }

  get x(): number { return this.sprite.x; }
  get y(): number { return this.sprite.y; }
  get width(): number { return this.state === "ducking" ? DINO_WIDTH + 10 : DINO_WIDTH; }
  get height(): number { return this.state === "ducking" ? DINO_DUCK_HEIGHT : DINO_HEIGHT; }

  get hitbox(): { x: number; y: number; w: number; h: number } {
    return {
      x: this.sprite.x + 4,
      y: this.sprite.y + 4,
      w: this.width - 8,
      h: this.height - 8,
    };
  }

  jump(): void {
    if (!this.isOnGround || this.state === "dead") return;
    this.velocityY = JUMP_VELOCITY;
    this.isOnGround = false;
    this.state = "jumping";
    this.sprite.setTexture("dino-run1");
  }

  duck(active: boolean): void {
    if (this.state === "dead") return;
    if (active && this.isOnGround) {
      this.state = "ducking";
    } else if (!active && this.state === "ducking") {
      this.state = "running";
    }
  }

  die(): void {
    this.state = "dead";
    this.sprite.setTexture("dino-dead");
  }

  reset(): void {
    this.state = "idle";
    this.velocityY = 0;
    this.isOnGround = true;
    this.sprite.setPosition(DINO_X, GROUND_Y - DINO_HEIGHT);
    this.sprite.setTexture("dino-run1");
  }

  update(dt: number): void {
    if (this.state === "dead" || this.state === "idle") return;

    // Gravity
    if (!this.isOnGround) {
      this.velocityY += GRAVITY * dt;
      this.sprite.y += this.velocityY * dt;

      // Land on ground
      if (this.sprite.y >= GROUND_Y - DINO_HEIGHT) {
        this.sprite.y = GROUND_Y - DINO_HEIGHT;
        this.velocityY = 0;
        this.isOnGround = true;
        this.state = "running";
      }
    }

    // Animation
    this.animTimer += dt * 1000;
    if (this.animTimer >= this.ANIM_INTERVAL) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 2;

      if (this.state === "running") {
        this.sprite.setTexture(this.animFrame === 0 ? "dino-run1" : "dino-run2");
      } else if (this.state === "ducking") {
        this.sprite.setTexture(this.animFrame === 0 ? "dino-duck1" : "dino-duck2");
      }
    }

    // Adjust sprite position for ducking
    if (this.state === "ducking") {
      this.sprite.y = GROUND_Y - DINO_DUCK_HEIGHT;
    } else if (this.isOnGround && this.state === "running") {
      this.sprite.y = GROUND_Y - DINO_HEIGHT;
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/entities/Dino.ts
git commit -m "feat: dino entity with jump, duck, animation states"
```

---

## Task 6: Basic GameScene — Dino Running on Ground

**Files:**
- Modify: `src/scenes/GameScene.ts`

- [ ] **Step 1: Replace GameScene stub with working dino-on-ground scene**

```typescript
import Phaser from "phaser";
import { CANVAS_WIDTH, GROUND_Y, INITIAL_SPEED, MAX_SPEED, SPEED_ACCEL } from "../config/constants";
import { TextureGen } from "../graphics/TextureGen";
import { Dino } from "../entities/Dino";

type GameState = "idle" | "playing" | "dead";

export class GameScene extends Phaser.Scene {
  private textureGen!: TextureGen;
  private dino!: Dino;
  private gameState: GameState = "idle";
  private speed = INITIAL_SPEED;
  private score = 0;

  // Ground scrolling
  private ground1!: Phaser.GameObjects.Image;
  private ground2!: Phaser.GameObjects.Image;

  // Clouds
  private clouds: Phaser.GameObjects.Image[] = [];
  private cloudTimer = 0;

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  // Center message
  private centerText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    this.textureGen = new TextureGen(this);
    this.textureGen.generate();

    // Ground
    this.ground1 = this.add.image(0, GROUND_Y, "ground").setOrigin(0, 0);
    this.ground2 = this.add.image(2400, GROUND_Y, "ground").setOrigin(0, 0);

    // Dino
    this.dino = new Dino(this);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Center text
    this.centerText = this.add.text(CANVAS_WIDTH / 2, 130, "Press SPACE to start", {
      fontSize: "16px",
      color: "#535353",
      fontFamily: "monospace",
    }).setOrigin(0.5);

    this.resetGame();
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;

    if (this.gameState === "idle") {
      if (this.spaceKey.isDown || this.cursors.up.isDown) {
        this.startGame();
      }
      return;
    }

    if (this.gameState === "dead") {
      if (this.spaceKey.isDown || this.cursors.up.isDown) {
        this.resetGame();
        this.startGame();
      }
      return;
    }

    // --- Playing ---

    // Input
    if (this.spaceKey.isDown || this.cursors.up.isDown) {
      this.dino.jump();
    }
    this.dino.duck(this.cursors.down.isDown);

    // Speed
    this.speed = Math.min(MAX_SPEED, this.speed + SPEED_ACCEL * dt);

    // Score
    this.score += this.speed * dt * 0.01;

    // Dino update
    this.dino.update(dt);

    // Ground scroll
    this.scrollGround(dt);

    // Clouds
    this.updateClouds(dt);
  }

  private startGame(): void {
    this.gameState = "playing";
    this.dino.state = "running";
    this.centerText.setVisible(false);
  }

  private resetGame(): void {
    this.gameState = "idle";
    this.speed = INITIAL_SPEED;
    this.score = 0;
    this.dino.reset();
    this.centerText.setText("Press SPACE to start").setVisible(true);
  }

  private scrollGround(dt: number): void {
    const dx = this.speed * dt;
    this.ground1.x -= dx;
    this.ground2.x -= dx;

    if (this.ground1.x <= -2400) {
      this.ground1.x = this.ground2.x + 2400;
    }
    if (this.ground2.x <= -2400) {
      this.ground2.x = this.ground1.x + 2400;
    }
  }

  private updateClouds(dt: number): void {
    this.cloudTimer += dt;
    if (this.cloudTimer > Phaser.Math.Between(3, 6)) {
      this.cloudTimer = 0;
      const y = Phaser.Math.Between(40, 120);
      const cloud = this.add.image(CANVAS_WIDTH + 60, y, "cloud").setOrigin(0, 0);
      this.clouds.push(cloud);
    }

    for (let i = this.clouds.length - 1; i >= 0; i--) {
      this.clouds[i].x -= this.speed * 0.3 * dt;
      if (this.clouds[i].x < -80) {
        this.clouds[i].destroy();
        this.clouds.splice(i, 1);
      }
    }
  }
}
```

- [ ] **Step 2: Verify**

Run: `npm run dev`
Expected: Monochrome dino runs on scrolling ground with clouds. Space to start, up/space to jump, down to duck. No obstacles yet.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/GameScene.ts
git commit -m "feat: basic game loop — dino running on ground with clouds"
```

---

## Task 7: Obstacles and Collision

**Files:**
- Create: `src/entities/Obstacle.ts`, `src/systems/Physics.ts`
- Modify: `src/scenes/GameScene.ts`

- [ ] **Step 1: Create Physics system**

```typescript
export interface AABB {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function aabbOverlap(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}
```

- [ ] **Step 2: Create Obstacle entity**

```typescript
import Phaser from "phaser";
import {
  GROUND_Y, CANVAS_WIDTH,
  CACTUS_SM, CACTUS_MD, CACTUS_LG, BIRD_SIZE,
} from "../config/constants";
import { AABB } from "../systems/Physics";

export type ObstacleKind = "cactus-sm" | "cactus-md" | "cactus-lg" | "bird-lo" | "bird-hi";

interface ObstacleSpec {
  texture: string;
  width: number;
  height: number;
  yOffset: number; // from GROUND_Y upward
}

const SPECS: Record<ObstacleKind, ObstacleSpec> = {
  "cactus-sm": { texture: "cactus-sm", width: CACTUS_SM.width, height: CACTUS_SM.height, yOffset: CACTUS_SM.height },
  "cactus-md": { texture: "cactus-md", width: CACTUS_MD.width, height: CACTUS_MD.height, yOffset: CACTUS_MD.height },
  "cactus-lg": { texture: "cactus-lg", width: CACTUS_LG.width, height: CACTUS_LG.height, yOffset: CACTUS_LG.height },
  "bird-lo":   { texture: "bird1", width: BIRD_SIZE.width, height: BIRD_SIZE.height, yOffset: 50 },
  "bird-hi":   { texture: "bird1", width: BIRD_SIZE.width, height: BIRD_SIZE.height, yOffset: 100 },
};

export class Obstacle {
  sprite: Phaser.GameObjects.Sprite;
  kind: ObstacleKind;
  private spec: ObstacleSpec;
  private scene: Phaser.Scene;

  // Bird animation
  private birdAnimTimer = 0;
  private birdFrame = 0;

  constructor(scene: Phaser.Scene, kind: ObstacleKind, x: number) {
    this.scene = scene;
    this.kind = kind;
    this.spec = SPECS[kind];

    const y = GROUND_Y - this.spec.yOffset;
    this.sprite = scene.add.sprite(x, y, this.spec.texture).setOrigin(0, 0);
  }

  get hitbox(): AABB {
    return {
      x: this.sprite.x + 2,
      y: this.sprite.y + 2,
      w: this.spec.width - 4,
      h: this.spec.height - 4,
    };
  }

  get isBird(): boolean {
    return this.kind === "bird-lo" || this.kind === "bird-hi";
  }

  update(dt: number, speed: number): void {
    this.sprite.x -= speed * dt;

    // Bird wing flap
    if (this.isBird) {
      this.birdAnimTimer += dt * 1000;
      if (this.birdAnimTimer > 200) {
        this.birdAnimTimer = 0;
        this.birdFrame = (this.birdFrame + 1) % 2;
        this.sprite.setTexture(this.birdFrame === 0 ? "bird1" : "bird2");
      }
    }
  }

  isOffScreen(): boolean {
    return this.sprite.x < -this.spec.width;
  }

  destroy(): void {
    this.sprite.destroy();
  }

  static pickKind(score: number, speed: number): ObstacleKind {
    // Birds only appear after THRESHOLD_FLYING_ENEMIES (800), handled by caller
    // Probability of bird increases with speed
    const birdProb = Math.min(0.35, (speed - 350) / 2500);
    if (score >= 800 && Math.random() < birdProb) {
      return Math.random() < 0.5 ? "bird-lo" : "bird-hi";
    }
    const r = Math.random();
    if (r < 0.4) return "cactus-sm";
    if (r < 0.75) return "cactus-md";
    return "cactus-lg";
  }
}
```

- [ ] **Step 3: Integrate obstacles and collision into GameScene**

Add to GameScene imports:

```typescript
import { Obstacle } from "../entities/Obstacle";
import { aabbOverlap } from "../systems/Physics";
import { MIN_OBSTACLE_GAP, MAX_OBSTACLE_GAP } from "../config/constants";
```

Add to class properties:

```typescript
private obstacles: Obstacle[] = [];
private distSinceLastObstacle = 0;
private nextObstacleGap = MIN_OBSTACLE_GAP;
private hiScore = 0;
private scoreText!: Phaser.GameObjects.Text;
private hiScoreText!: Phaser.GameObjects.Text;
```

Add score display to `create()` (before `resetGame()`):

```typescript
this.hiScore = parseInt(localStorage.getItem("hiScore") || "0", 10);
this.hiScoreText = this.add.text(CANVAS_WIDTH - 10, 10, "", {
  fontSize: "14px", color: "#888888", fontFamily: "monospace",
}).setOrigin(1, 0);
this.scoreText = this.add.text(CANVAS_WIDTH - 10, 28, "00000", {
  fontSize: "14px", color: "#535353", fontFamily: "monospace",
}).setOrigin(1, 0);
```

Add to the `update()` "Playing" section after score update:

```typescript
// Obstacles
this.spawnObstacles(dt);
this.updateObstacles(dt);
this.checkCollisions();

// Score display
this.scoreText.setText(String(Math.floor(this.score)).padStart(5, "0"));
if (this.hiScore > 0) {
  this.hiScoreText.setText("HI " + String(this.hiScore).padStart(5, "0"));
}
```

Add these methods to GameScene:

```typescript
private spawnObstacles(dt: number): void {
  this.distSinceLastObstacle += this.speed * dt;
  if (this.distSinceLastObstacle >= this.nextObstacleGap) {
    this.distSinceLastObstacle = 0;
    this.nextObstacleGap = Phaser.Math.Between(MIN_OBSTACLE_GAP, MAX_OBSTACLE_GAP);
    const kind = Obstacle.pickKind(this.score, this.speed);
    const obs = new Obstacle(this, kind, CANVAS_WIDTH + 10);
    this.obstacles.push(obs);
  }
}

private updateObstacles(dt: number): void {
  for (let i = this.obstacles.length - 1; i >= 0; i--) {
    this.obstacles[i].update(dt, this.speed);
    if (this.obstacles[i].isOffScreen()) {
      this.obstacles[i].destroy();
      this.obstacles.splice(i, 1);
    }
  }
}

private checkCollisions(): void {
  const dinoBox = this.dino.hitbox;
  for (const obs of this.obstacles) {
    if (aabbOverlap(dinoBox, obs.hitbox)) {
      this.gameOver();
      return;
    }
  }
}

private gameOver(): void {
  this.gameState = "dead";
  this.dino.die();
  if (this.score > this.hiScore) {
    this.hiScore = Math.floor(this.score);
    localStorage.setItem("hiScore", String(this.hiScore));
  }
  this.centerText.setText("GAME OVER - Press SPACE").setVisible(true);
}
```

Update `resetGame()` to clear obstacles:

```typescript
private resetGame(): void {
  this.gameState = "idle";
  this.speed = INITIAL_SPEED;
  this.score = 0;
  this.distSinceLastObstacle = 0;
  this.dino.reset();
  for (const obs of this.obstacles) obs.destroy();
  this.obstacles = [];
  this.centerText.setText("Press SPACE to start").setVisible(true);
}
```

- [ ] **Step 4: Verify**

Run: `npm run dev`
Expected: Full Chrome dino clone — cacti spawn and scroll, collision kills dino, score counts, hi-score persists. No birds yet (they appear after score 800 per the threshold).

- [ ] **Step 5: Commit**

```bash
git add src/entities/Obstacle.ts src/systems/Physics.ts src/scenes/GameScene.ts
git commit -m "feat: obstacles, AABB collision, score tracking"
```

---

## Task 8: Chrome Error Page Overlay

**Files:**
- Create: `src/ui/ChromeOverlay.ts`
- Modify: `index.html`

- [ ] **Step 1: Add Chrome overlay HTML to index.html**

Replace the `<body>` content (keep the script tag):

```html
<body>
  <div id="chrome-overlay">
    <div class="chrome-icon">
      <div class="chrome-dino-icon"></div>
    </div>
    <h1 class="chrome-title">No internet</h1>
    <p class="chrome-message">Try:</p>
    <ul class="chrome-list">
      <li>Checking the network cables, modem, and router</li>
      <li>Reconnecting to Wi-Fi</li>
    </ul>
    <p class="chrome-error-code">ERR_INTERNET_DISCONNECTED</p>
  </div>
  <script type="module" src="/src/main.ts"></script>
</body>
```

Add these styles to the `<style>` block:

```css
#chrome-overlay {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 10;
  padding: 40px 20px 20px;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #646464;
  pointer-events: none;
  transition: opacity 0.8s ease;
}
.chrome-icon {
  margin-bottom: 20px;
}
.chrome-dino-icon {
  display: inline-block;
  width: 60px;
  height: 50px;
  background: #535353;
  clip-path: polygon(
    30% 0%, 70% 0%, 70% 20%, 90% 20%, 90% 30%,
    100% 30%, 100% 60%, 80% 60%, 80% 80%, 60% 80%,
    60% 100%, 40% 100%, 40% 80%, 20% 80%, 20% 60%,
    0% 60%, 0% 40%, 20% 40%, 20% 20%, 30% 20%
  );
}
.chrome-title {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}
.chrome-message {
  font-size: 14px;
  margin-bottom: 4px;
}
.chrome-list {
  font-size: 13px;
  list-style: disc inside;
  margin-bottom: 16px;
  line-height: 1.6;
}
.chrome-error-code {
  font-size: 11px;
  color: #999;
}
@media (max-width: 600px) {
  #chrome-overlay {
    padding: 20px 16px 10px;
  }
  .chrome-title { font-size: 16px; }
  .chrome-list { font-size: 12px; }
  .chrome-dino-icon { width: 40px; height: 34px; }
}
```

- [ ] **Step 2: Create ChromeOverlay controller**

```typescript
import {
  THRESHOLD_COLOR_TINT,
  THRESHOLD_SKY_COLOR,
  THRESHOLD_FULL_COLOR,
} from "../config/constants";

export class ChromeOverlay {
  private el: HTMLElement | null;
  private removed = false;

  constructor() {
    this.el = document.getElementById("chrome-overlay");
  }

  update(score: number): void {
    if (this.removed || !this.el) return;

    if (score >= THRESHOLD_FULL_COLOR) {
      this.el.remove();
      this.removed = true;
      return;
    }

    if (score >= THRESHOLD_COLOR_TINT) {
      // Fade from 1.0 to 0.0 between THRESHOLD_COLOR_TINT and THRESHOLD_FULL_COLOR
      const progress = (score - THRESHOLD_COLOR_TINT) / (THRESHOLD_FULL_COLOR - THRESHOLD_COLOR_TINT);
      this.el.style.opacity = String(1 - progress);
    }
  }

  reset(): void {
    if (this.removed) {
      // Re-create a simple version for replaying
      return;
    }
    if (this.el) {
      this.el.style.opacity = "1";
    }
  }
}
```

- [ ] **Step 3: Integrate into GameScene**

Add import and property:
```typescript
import { ChromeOverlay } from "../ui/ChromeOverlay";
// ...
private chromeOverlay!: ChromeOverlay;
```

In `create()`:
```typescript
this.chromeOverlay = new ChromeOverlay();
```

In `update()` playing section, after score update:
```typescript
this.chromeOverlay.update(this.score);
```

- [ ] **Step 4: Verify**

Run: `npm run dev`
Expected: Page shows "No internet" Chrome error text overlaying the game canvas. As score increases past 200, the overlay starts fading. By 1000, it's completely gone.

- [ ] **Step 5: Commit**

```bash
git add index.html src/ui/ChromeOverlay.ts src/scenes/GameScene.ts
git commit -m "feat: fake Chrome error page overlay with score-based fade"
```

---

## Task 9: PhaseManager — Evolution Event System

**Files:**
- Create: `src/systems/PhaseManager.ts`
- Modify: `src/scenes/GameScene.ts`

- [ ] **Step 1: Create PhaseManager**

```typescript
import Phaser from "phaser";
import {
  THRESHOLD_COLOR_TINT,
  THRESHOLD_SKY_COLOR,
  THRESHOLD_PLATFORMS,
  THRESHOLD_FLYING_ENEMIES,
  THRESHOLD_FULL_COLOR,
  THRESHOLD_COLLECTIBLES,
  THRESHOLD_POWERUPS,
  THRESHOLD_LANES,
  THRESHOLD_BOSS_PATTERNS,
} from "../config/constants";

export type PhaseEvent =
  | "unlock:colorTint"
  | "unlock:skyColor"
  | "unlock:platforms"
  | "unlock:flyingEnemies"
  | "unlock:fullColor"
  | "unlock:collectibles"
  | "unlock:powerups"
  | "unlock:lanes"
  | "unlock:bossPatterns";

interface Milestone {
  threshold: number;
  event: PhaseEvent;
}

const MILESTONES: Milestone[] = [
  { threshold: THRESHOLD_COLOR_TINT, event: "unlock:colorTint" },
  { threshold: THRESHOLD_SKY_COLOR, event: "unlock:skyColor" },
  { threshold: THRESHOLD_PLATFORMS, event: "unlock:platforms" },
  { threshold: THRESHOLD_FLYING_ENEMIES, event: "unlock:flyingEnemies" },
  { threshold: THRESHOLD_FULL_COLOR, event: "unlock:fullColor" },
  { threshold: THRESHOLD_COLLECTIBLES, event: "unlock:collectibles" },
  { threshold: THRESHOLD_POWERUPS, event: "unlock:powerups" },
  { threshold: THRESHOLD_LANES, event: "unlock:lanes" },
  { threshold: THRESHOLD_BOSS_PATTERNS, event: "unlock:bossPatterns" },
];

export class PhaseManager {
  private emitter: Phaser.Events.EventEmitter;
  private unlocked: Set<PhaseEvent> = new Set();

  constructor() {
    this.emitter = new Phaser.Events.EventEmitter();
  }

  on(event: PhaseEvent, callback: () => void): void {
    this.emitter.on(event, callback);
  }

  isUnlocked(event: PhaseEvent): boolean {
    return this.unlocked.has(event);
  }

  /** Returns a 0-1 progress value for the color evolution (200-1000 range) */
  colorProgress(score: number): number {
    if (score < THRESHOLD_COLOR_TINT) return 0;
    if (score >= THRESHOLD_FULL_COLOR) return 1;
    return (score - THRESHOLD_COLOR_TINT) / (THRESHOLD_FULL_COLOR - THRESHOLD_COLOR_TINT);
  }

  update(score: number): void {
    for (const m of MILESTONES) {
      if (score >= m.threshold && !this.unlocked.has(m.event)) {
        this.unlocked.add(m.event);
        this.emitter.emit(m.event);
      }
    }
  }

  reset(): void {
    this.unlocked.clear();
  }
}
```

- [ ] **Step 2: Integrate into GameScene**

Add import and property:
```typescript
import { PhaseManager } from "../systems/PhaseManager";
// ...
private phaseManager!: PhaseManager;
```

In `create()`:
```typescript
this.phaseManager = new PhaseManager();

// Wire up phase events
this.phaseManager.on("unlock:colorTint", () => {
  // Will be used for visual evolution in Task 10
});
this.phaseManager.on("unlock:platforms", () => {
  // Will be used for platforms in Task 11
});
```

In `update()` playing section:
```typescript
this.phaseManager.update(this.score);
```

In `resetGame()`:
```typescript
this.phaseManager.reset();
```

- [ ] **Step 3: Commit**

```bash
git add src/systems/PhaseManager.ts src/scenes/GameScene.ts
git commit -m "feat: PhaseManager score-based evolution event system"
```

---

## Task 10: Visual Evolution — Color Transitions and Parallax

**Files:**
- Modify: `src/scenes/GameScene.ts`, `src/graphics/TextureGen.ts`

- [ ] **Step 1: Add sky gradient and color evolution to GameScene**

Add properties:
```typescript
private skyGradient!: Phaser.GameObjects.Graphics;
private parallaxLayers: Phaser.GameObjects.Image[] = [];
```

In `create()`, before ground creation:
```typescript
// Sky gradient (hidden initially)
this.skyGradient = this.add.graphics();
this.skyGradient.setAlpha(0);
```

Add method for drawing sky:
```typescript
private updateSkyGradient(progress: number): void {
  this.skyGradient.clear();
  this.skyGradient.setAlpha(progress);

  // Gradient from light blue to lighter blue
  const steps = 10;
  const h = CANVAS_HEIGHT / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const r = Math.floor(135 + (245 - 135) * t);
    const g = Math.floor(206 + (245 - 206) * t);
    const b = Math.floor(235 + (250 - 235) * t);
    const color = (r << 16) | (g << 8) | b;
    this.skyGradient.fillStyle(color);
    this.skyGradient.fillRect(0, i * h, CANVAS_WIDTH, h);
  }
}
```

Add parallax background method:
```typescript
private createParallaxLayers(): void {
  // Simple mountain silhouette in the background
  const g = this.add.graphics();
  g.fillStyle(0xbbbbbb, 0.3);
  // Mountains
  g.fillTriangle(0, 200, 100, 80, 200, 200);
  g.fillTriangle(150, 200, 280, 60, 410, 200);
  g.fillTriangle(350, 200, 500, 100, 650, 200);
  g.fillTriangle(550, 200, 700, 70, 850, 200);
  g.generateTexture("parallax-bg", CANVAS_WIDTH, CANVAS_HEIGHT);
  g.destroy();

  const bg1 = this.add.image(0, 0, "parallax-bg").setOrigin(0, 0).setAlpha(0);
  const bg2 = this.add.image(CANVAS_WIDTH, 0, "parallax-bg").setOrigin(0, 0).setAlpha(0);
  this.parallaxLayers = [bg1, bg2];

  // Ensure correct draw order: sky -> parallax -> ground -> entities
  this.skyGradient.setDepth(0);
  bg1.setDepth(1);
  bg2.setDepth(1);
  this.ground1.setDepth(2);
  this.ground2.setDepth(2);
  this.dino.sprite.setDepth(3);
  this.scoreText.setDepth(5);
  this.hiScoreText.setDepth(5);
  this.centerText.setDepth(5);
}
```

Wire up PhaseManager events in `create()`:
```typescript
this.phaseManager.on("unlock:skyColor", () => {
  this.createParallaxLayers();
});
```

In `update()` playing section, add color progress updates:
```typescript
// Visual evolution
const colorProgress = this.phaseManager.colorProgress(this.score);
if (colorProgress > 0) {
  this.updateSkyGradient(colorProgress);
  // Fade in parallax
  for (const bg of this.parallaxLayers) {
    bg.setAlpha(colorProgress * 0.4);
  }
}

// Scroll parallax
for (let i = 0; i < this.parallaxLayers.length; i++) {
  this.parallaxLayers[i].x -= this.speed * 0.1 * dt;
}
if (this.parallaxLayers.length >= 2) {
  if (this.parallaxLayers[0].x <= -CANVAS_WIDTH) {
    this.parallaxLayers[0].x = this.parallaxLayers[1].x + CANVAS_WIDTH;
  }
  if (this.parallaxLayers[1].x <= -CANVAS_WIDTH) {
    this.parallaxLayers[1].x = this.parallaxLayers[0].x + CANVAS_WIDTH;
  }
}
```

- [ ] **Step 2: Verify**

Run: `npm run dev`
Expected: As score passes 400, sky gradient fades in. After 800, parallax mountain silhouettes appear. By 1000, full color.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/GameScene.ts
git commit -m "feat: visual evolution — sky gradient, parallax backgrounds"
```

---

## Task 11: Platforms

**Files:**
- Create: `src/entities/Platform.ts`
- Modify: `src/scenes/GameScene.ts`, `src/entities/Dino.ts`

- [ ] **Step 1: Create Platform entity**

```typescript
import Phaser from "phaser";
import { PLATFORM_WIDTH, PLATFORM_HEIGHT, GROUND_Y } from "../config/constants";
import { AABB } from "../systems/Physics";

export class Platform {
  sprite: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.image(x, y, "platform").setOrigin(0, 0);
    this.sprite.setDepth(2);
  }

  get hitbox(): AABB {
    return {
      x: this.sprite.x,
      y: this.sprite.y,
      w: PLATFORM_WIDTH,
      h: 6, // Only top surface for landing
    };
  }

  get topY(): number {
    return this.sprite.y;
  }

  update(dt: number, speed: number): void {
    this.sprite.x -= speed * dt;
  }

  isOffScreen(): boolean {
    return this.sprite.x < -PLATFORM_WIDTH;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
```

- [ ] **Step 2: Add platform landing to Dino**

Add method to Dino class:

```typescript
landOnPlatform(platformY: number): void {
  if (this.velocityY > 0 && this.sprite.y + this.height <= platformY + 10) {
    this.sprite.y = platformY - this.height;
    this.velocityY = 0;
    this.isOnGround = true;
    this.state = "running";
  }
}

/** Check if dino is standing on a surface (ground or platform). Called each frame. */
checkFalling(platforms: Array<{ hitbox: { x: number; y: number; w: number; h: number }; topY: number }>): void {
  if (this.state === "dead" || !this.isOnGround || this.sprite.y >= GROUND_Y - DINO_HEIGHT) return;

  // Check if still on a platform
  const dinoBottom = this.sprite.y + this.height;
  const dinoLeft = this.sprite.x;
  const dinoRight = this.sprite.x + this.width;

  for (const p of platforms) {
    if (dinoLeft < p.hitbox.x + p.hitbox.w &&
        dinoRight > p.hitbox.x &&
        Math.abs(dinoBottom - p.topY) < 4) {
      return; // Still on platform
    }
  }

  // Fell off platform
  this.isOnGround = false;
  this.state = "jumping";
}
```

- [ ] **Step 3: Integrate platforms into GameScene**

Add imports and properties:
```typescript
import { Platform } from "../entities/Platform";
// ...
private platforms: Platform[] = [];
private platformsUnlocked = false;
private distSinceLastPlatform = 0;
```

Generate platform texture in `create()`:
```typescript
this.textureGen.generatePlatform();
```

Wire up PhaseManager:
```typescript
this.phaseManager.on("unlock:platforms", () => {
  this.platformsUnlocked = true;
});
```

Add platform spawning and update methods:
```typescript
private spawnPlatforms(dt: number): void {
  if (!this.platformsUnlocked) return;
  this.distSinceLastPlatform += this.speed * dt;
  if (this.distSinceLastPlatform >= Phaser.Math.Between(500, 900)) {
    this.distSinceLastPlatform = 0;
    const y = Phaser.Math.Between(GROUND_Y - 90, GROUND_Y - 50);
    const platform = new Platform(this, CANVAS_WIDTH + 10, y);
    this.platforms.push(platform);
  }
}

private updatePlatforms(dt: number): void {
  for (let i = this.platforms.length - 1; i >= 0; i--) {
    this.platforms[i].update(dt, this.speed);
    if (this.platforms[i].isOffScreen()) {
      this.platforms[i].destroy();
      this.platforms.splice(i, 1);
    }
  }

  // Platform landing check
  if (this.dino.velocityY > 0) {
    for (const p of this.platforms) {
      this.dino.landOnPlatform(p.topY);
    }
  }

  // Check if dino walked off platform
  this.dino.checkFalling(this.platforms);
}
```

Call from `update()` playing section:
```typescript
this.spawnPlatforms(dt);
this.updatePlatforms(dt);
```

Clear platforms in `resetGame()`:
```typescript
for (const p of this.platforms) p.destroy();
this.platforms = [];
this.platformsUnlocked = false;
this.distSinceLastPlatform = 0;
```

- [ ] **Step 4: Verify**

Run: `npm run dev`
Expected: After score 600, elevated platforms appear. Dino can jump onto them and walk off them (falls back down).

- [ ] **Step 5: Commit**

```bash
git add src/entities/Platform.ts src/entities/Dino.ts src/scenes/GameScene.ts
git commit -m "feat: elevated platforms with one-way landing"
```

---

## Task 12: Collectibles

**Files:**
- Create: `src/entities/Collectible.ts`
- Modify: `src/scenes/GameScene.ts`

- [ ] **Step 1: Create Collectible entity**

```typescript
import Phaser from "phaser";
import { GROUND_Y } from "../config/constants";
import { AABB } from "../systems/Physics";

export class Collectible {
  sprite: Phaser.GameObjects.Image;
  collected = false;

  constructor(scene: Phaser.Scene, x: number, y?: number) {
    const posY = y ?? GROUND_Y - 30;
    this.sprite = scene.add.image(x, posY, "coin").setOrigin(0, 0);
    this.sprite.setDepth(3);
  }

  get hitbox(): AABB {
    return { x: this.sprite.x, y: this.sprite.y, w: 16, h: 16 };
  }

  update(dt: number, speed: number): void {
    this.sprite.x -= speed * dt;
  }

  collect(): void {
    this.collected = true;
    this.sprite.destroy();
  }

  isOffScreen(): boolean {
    return this.sprite.x < -20;
  }

  destroy(): void {
    if (!this.collected) this.sprite.destroy();
  }
}
```

- [ ] **Step 2: Integrate into GameScene**

Add imports and properties:
```typescript
import { Collectible } from "../entities/Collectible";
// ...
private collectibles: Collectible[] = [];
private collectiblesUnlocked = false;
private distSinceLastCollectible = 0;
```

Generate textures in `create()`:
```typescript
this.textureGen.generateCollectible();
```

Wire PhaseManager:
```typescript
this.phaseManager.on("unlock:collectibles", () => {
  this.collectiblesUnlocked = true;
});
```

Add methods:
```typescript
private spawnCollectibles(dt: number): void {
  if (!this.collectiblesUnlocked) return;
  this.distSinceLastCollectible += this.speed * dt;
  if (this.distSinceLastCollectible >= Phaser.Math.Between(200, 500)) {
    this.distSinceLastCollectible = 0;
    // Sometimes place on platforms, sometimes on ground level
    let y = GROUND_Y - 30;
    if (this.platforms.length > 0 && Math.random() < 0.3) {
      const p = this.platforms[this.platforms.length - 1];
      y = p.topY - 20;
    }
    const coin = new Collectible(this, CANVAS_WIDTH + 10, y);
    this.collectibles.push(coin);
  }
}

private updateCollectibles(dt: number): void {
  const dinoBox = this.dino.hitbox;
  for (let i = this.collectibles.length - 1; i >= 0; i--) {
    const c = this.collectibles[i];
    c.update(dt, this.speed);
    if (!c.collected && aabbOverlap(dinoBox, c.hitbox)) {
      c.collect();
      this.score += 10; // Bonus points
      this.collectibles.splice(i, 1);
    } else if (c.isOffScreen()) {
      c.destroy();
      this.collectibles.splice(i, 1);
    }
  }
}
```

Call from `update()`:
```typescript
this.spawnCollectibles(dt);
this.updateCollectibles(dt);
```

Clear in `resetGame()`:
```typescript
for (const c of this.collectibles) c.destroy();
this.collectibles = [];
this.collectiblesUnlocked = false;
this.distSinceLastCollectible = 0;
```

- [ ] **Step 3: Verify**

Run: `npm run dev`
Expected: After score 1200, gold coins appear. Collecting them adds 10 to score.

- [ ] **Step 4: Commit**

```bash
git add src/entities/Collectible.ts src/scenes/GameScene.ts
git commit -m "feat: collectible coins with score bonus"
```

---

## Task 13: Power-ups (Shield, Magnet, Auto-play Temporary)

**Files:**
- Create: `src/entities/PowerUp.ts`
- Modify: `src/scenes/GameScene.ts`

- [ ] **Step 1: Create PowerUp entity**

```typescript
import Phaser from "phaser";
import { GROUND_Y, SHIELD_DURATION, MAGNET_DURATION, AUTOPLAY_POWERUP_DURATION } from "../config/constants";
import { AABB } from "../systems/Physics";

export type PowerUpType = "shield" | "magnet" | "autoplay";

interface PowerUpConfig {
  texture: string;
  duration: number; // ms, 0 = until consumed
}

const CONFIGS: Record<PowerUpType, PowerUpConfig> = {
  shield: { texture: "powerup-shield", duration: SHIELD_DURATION },
  magnet: { texture: "powerup-magnet", duration: MAGNET_DURATION },
  autoplay: { texture: "powerup-autoplay", duration: AUTOPLAY_POWERUP_DURATION },
};

export class PowerUp {
  sprite: Phaser.GameObjects.Image;
  type: PowerUpType;
  collected = false;

  constructor(scene: Phaser.Scene, x: number, type: PowerUpType, y?: number) {
    this.type = type;
    const posY = y ?? GROUND_Y - 28;
    const config = CONFIGS[type];
    this.sprite = scene.add.image(x, posY, config.texture).setOrigin(0, 0);
    this.sprite.setDepth(3);
  }

  get hitbox(): AABB {
    return { x: this.sprite.x, y: this.sprite.y, w: 20, h: 20 };
  }

  get duration(): number {
    return CONFIGS[this.type].duration;
  }

  update(dt: number, speed: number): void {
    this.sprite.x -= speed * dt;
    // Bobbing animation
    this.sprite.y += Math.sin(Date.now() / 200) * 0.3;
  }

  collect(): void {
    this.collected = true;
    this.sprite.destroy();
  }

  isOffScreen(): boolean {
    return this.sprite.x < -30;
  }

  destroy(): void {
    if (!this.collected) this.sprite.destroy();
  }

  static randomType(): PowerUpType {
    const types: PowerUpType[] = ["shield", "magnet", "autoplay"];
    return types[Math.floor(Math.random() * types.length)];
  }
}
```

- [ ] **Step 2: Integrate into GameScene**

Add imports and properties:
```typescript
import { PowerUp, PowerUpType } from "../entities/PowerUp";
// ...
private powerUps: PowerUp[] = [];
private powerUpsUnlocked = false;
private distSinceLastPowerUp = 0;

// Active power-up state
private activeShield = false;
private activeMagnetTime = 0;
private activeAutoPlayTime = 0;
private shieldIndicator?: Phaser.GameObjects.Graphics;
```

Generate textures in `create()`:
```typescript
this.textureGen.generatePowerUps();
```

Wire PhaseManager:
```typescript
this.phaseManager.on("unlock:powerups", () => {
  this.powerUpsUnlocked = true;
});
```

Add methods:
```typescript
private spawnPowerUps(dt: number): void {
  if (!this.powerUpsUnlocked) return;
  this.distSinceLastPowerUp += this.speed * dt;
  if (this.distSinceLastPowerUp >= Phaser.Math.Between(1500, 3000)) {
    this.distSinceLastPowerUp = 0;
    const type = PowerUp.randomType();
    const pu = new PowerUp(this, CANVAS_WIDTH + 10, type);
    this.powerUps.push(pu);
  }
}

private updatePowerUps(dt: number): void {
  const dinoBox = this.dino.hitbox;
  for (let i = this.powerUps.length - 1; i >= 0; i--) {
    const pu = this.powerUps[i];
    pu.update(dt, this.speed);
    if (!pu.collected && aabbOverlap(dinoBox, pu.hitbox)) {
      this.activatePowerUp(pu.type, pu.duration);
      pu.collect();
      this.powerUps.splice(i, 1);
    } else if (pu.isOffScreen()) {
      pu.destroy();
      this.powerUps.splice(i, 1);
    }
  }

  // Magnet effect: attract collectibles
  if (this.activeMagnetTime > 0) {
    this.activeMagnetTime -= dt * 1000;
    for (const c of this.collectibles) {
      const dx = this.dino.x - c.sprite.x;
      const dy = this.dino.y - c.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        c.sprite.x += dx * 3 * dt;
        c.sprite.y += dy * 3 * dt;
      }
    }
  }

  // Auto-play temporary
  if (this.activeAutoPlayTime > 0) {
    this.activeAutoPlayTime -= dt * 1000;
  }

  // Shield visual
  if (this.activeShield) {
    if (!this.shieldIndicator) {
      this.shieldIndicator = this.add.graphics();
      this.shieldIndicator.setDepth(4);
    }
    this.shieldIndicator.clear();
    this.shieldIndicator.lineStyle(2, 0x4488ff, 0.6);
    this.shieldIndicator.strokeRect(
      this.dino.x - 4, this.dino.y - 4,
      this.dino.width + 8, this.dino.height + 8
    );
  }
}

private activatePowerUp(type: PowerUpType, duration: number): void {
  switch (type) {
    case "shield":
      this.activeShield = true;
      break;
    case "magnet":
      this.activeMagnetTime = duration;
      break;
    case "autoplay":
      this.activeAutoPlayTime = duration;
      break;
  }
}
```

Modify `checkCollisions()` to respect shield:
```typescript
private checkCollisions(): void {
  const dinoBox = this.dino.hitbox;
  for (const obs of this.obstacles) {
    if (aabbOverlap(dinoBox, obs.hitbox)) {
      if (this.activeShield) {
        this.activeShield = false;
        if (this.shieldIndicator) {
          this.shieldIndicator.destroy();
          this.shieldIndicator = undefined;
        }
        obs.destroy();
        this.obstacles.splice(this.obstacles.indexOf(obs), 1);
        return;
      }
      this.gameOver();
      return;
    }
  }
}
```

Call from `update()`:
```typescript
this.spawnPowerUps(dt);
this.updatePowerUps(dt);
```

Clear in `resetGame()`:
```typescript
for (const pu of this.powerUps) pu.destroy();
this.powerUps = [];
this.powerUpsUnlocked = false;
this.distSinceLastPowerUp = 0;
this.activeShield = false;
this.activeMagnetTime = 0;
this.activeAutoPlayTime = 0;
if (this.shieldIndicator) { this.shieldIndicator.destroy(); this.shieldIndicator = undefined; }
```

- [ ] **Step 3: Verify**

Run: `npm run dev`
Expected: After score 1500, power-ups spawn. Shield absorbs one hit, magnet attracts coins, auto-play controls dino temporarily.

- [ ] **Step 4: Commit**

```bash
git add src/entities/PowerUp.ts src/scenes/GameScene.ts
git commit -m "feat: power-ups — shield, magnet, temporary auto-play"
```

---

## Task 14: InputManager with Touch Controls

**Files:**
- Create: `src/systems/InputManager.ts`
- Modify: `src/scenes/GameScene.ts`

- [ ] **Step 1: Create InputManager**

```typescript
import Phaser from "phaser";

export interface InputState {
  jump: boolean;
  duck: boolean;
  laneUp: boolean;
  laneDown: boolean;
}

export class InputManager {
  private scene: Phaser.Scene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private lanesUnlocked = false;

  // Touch state
  private touchStartY = 0;
  private touchActive = false;
  private swipeDirection: "up" | "down" | null = null;
  private tapped = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Touch events
    scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.touchStartY = pointer.y;
      this.touchActive = true;
      this.tapped = true;
    });

    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.touchActive) return;
      const dy = pointer.y - this.touchStartY;
      if (Math.abs(dy) > 30) {
        this.swipeDirection = dy > 0 ? "down" : "up";
        this.tapped = false;
      }
    });

    scene.input.on("pointerup", () => {
      this.touchActive = false;
      // Reset swipe after a short delay
      this.scene.time.delayedCall(100, () => {
        this.swipeDirection = null;
      });
    });
  }

  unlockLanes(): void {
    this.lanesUnlocked = true;
  }

  getState(): InputState {
    const jump = this.spaceKey.isDown || this.cursors.up.isDown || this.tapped;
    const duck = this.cursors.down.isDown || this.swipeDirection === "down";

    // Consume tap
    if (this.tapped) this.tapped = false;

    return {
      jump,
      duck,
      laneUp: this.lanesUnlocked && (this.cursors.up.isDown || this.swipeDirection === "up"),
      laneDown: this.lanesUnlocked && (this.cursors.down.isDown || this.swipeDirection === "down"),
    };
  }

  /** Returns true if any start input is pressed (for idle/dead state transitions) */
  isStartPressed(): boolean {
    return this.spaceKey.isDown || this.cursors.up.isDown || this.tapped;
  }
}
```

- [ ] **Step 2: Refactor GameScene to use InputManager**

Replace the direct keyboard references in GameScene:

Remove old input properties (`cursors`, `spaceKey`) and their setup in `create()`.

Add:
```typescript
import { InputManager } from "../systems/InputManager";
// ...
private inputManager!: InputManager;
```

In `create()`:
```typescript
this.inputManager = new InputManager(this);

this.phaseManager.on("unlock:lanes", () => {
  this.inputManager.unlockLanes();
});
```

In `update()`, replace input checks:
```typescript
// Idle/dead state transitions
if (this.gameState === "idle" || this.gameState === "dead") {
  if (this.inputManager.isStartPressed()) {
    if (this.gameState === "dead") this.resetGame();
    this.startGame();
  }
  return;
}

// Playing — get input state
const input = this.inputManager.getState();
if (input.jump) this.dino.jump();
this.dino.duck(input.duck);
```

- [ ] **Step 3: Verify**

Run: `npm run dev`
Expected: Keyboard controls still work. On touch devices (use Chrome DevTools mobile emulation), tap to jump, swipe down to duck.

- [ ] **Step 4: Commit**

```bash
git add src/systems/InputManager.ts src/scenes/GameScene.ts
git commit -m "feat: InputManager with touch controls"
```

---

## Task 15: Lane System

**Files:**
- Modify: `src/scenes/GameScene.ts`, `src/entities/Dino.ts`

- [ ] **Step 1: Add lane switching to Dino**

Add to Dino class:

```typescript
private currentLane = 2; // 0=top, 1=mid, 2=bottom (ground)
private lanesActive = false;
private lanePositions = LANE_POSITIONS; // from constants

enableLanes(): void {
  this.lanesActive = true;
  this.currentLane = 2; // Start at bottom
}

switchLane(direction: "up" | "down"): void {
  if (!this.lanesActive || this.state === "dead") return;
  if (direction === "up" && this.currentLane > 0) {
    this.currentLane--;
  } else if (direction === "down" && this.currentLane < LANE_COUNT - 1) {
    this.currentLane++;
  }
}

get targetY(): number {
  if (!this.lanesActive) return GROUND_Y;
  return this.lanePositions[this.currentLane];
}

get lane(): number {
  return this.currentLane;
}
```

Add import for `LANE_COUNT, LANE_POSITIONS` to Dino.ts.

In `Dino.update()`, when lanes are active, smoothly move to target lane y:
```typescript
// Lane movement (when active)
if (this.lanesActive && this.isOnGround) {
  const targetY = this.lanePositions[this.currentLane] - this.height;
  const diff = targetY - this.sprite.y;
  if (Math.abs(diff) > 1) {
    this.sprite.y += diff * 8 * dt; // Smooth interpolation
  } else {
    this.sprite.y = targetY;
  }
}
```

- [ ] **Step 2: Integrate lane switching into GameScene**

Wire PhaseManager in `create()`:
```typescript
this.phaseManager.on("unlock:lanes", () => {
  this.dino.enableLanes();
  this.inputManager.unlockLanes();
});
```

In `update()` playing input section, add lane switching:
```typescript
const input = this.inputManager.getState();
if (this.phaseManager.isUnlocked("unlock:lanes")) {
  if (input.laneUp) this.dino.switchLane("up");
  if (input.laneDown) this.dino.switchLane("down");
} else {
  if (input.jump) this.dino.jump();
  this.dino.duck(input.duck);
}
```

- [ ] **Step 3: Verify**

Run: `npm run dev`
Expected: After score 2000, up/down arrows switch between 3 lanes instead of jump/duck. Dino smoothly transitions between lane positions.

- [ ] **Step 4: Commit**

```bash
git add src/entities/Dino.ts src/scenes/GameScene.ts
git commit -m "feat: lane system — 3 vertical lanes with smooth switching"
```

---

## Task 16: Auto-play AI

**Files:**
- Create: `src/systems/AutoPlayAI.ts`
- Modify: `src/scenes/GameScene.ts`

- [ ] **Step 1: Create AutoPlayAI**

```typescript
import { Dino } from "../entities/Dino";
import { Obstacle } from "../entities/Obstacle";
import { Platform } from "../entities/Platform";
import { Collectible } from "../entities/Collectible";
import { PowerUp } from "../entities/PowerUp";
import { DINO_X, AUTOPLAY_REACT_MS, AUTOPLAY_UNLOCK_SCORE } from "../config/constants";

export class AutoPlayAI {
  private permanentlyUnlocked = false;
  private permanentMode = false;

  constructor() {
    this.permanentlyUnlocked = localStorage.getItem("autoplayUnlocked") === "true";
  }

  get isActive(): boolean {
    return this.permanentMode;
  }

  get isUnlocked(): boolean {
    return this.permanentlyUnlocked;
  }

  checkUnlock(score: number): void {
    if (!this.permanentlyUnlocked && score >= AUTOPLAY_UNLOCK_SCORE) {
      this.permanentlyUnlocked = true;
      localStorage.setItem("autoplayUnlocked", "true");
    }
  }

  togglePermanentMode(): void {
    if (this.permanentlyUnlocked) {
      this.permanentMode = !this.permanentMode;
    }
  }

  decide(
    dino: Dino,
    obstacles: Obstacle[],
    speed: number,
    _platforms: Platform[],
    _collectibles: Collectible[],
    _powerUps: PowerUp[],
  ): { jump: boolean; duck: boolean; laneUp: boolean; laneDown: boolean } {
    const result = { jump: false, duck: false, laneUp: false, laneDown: false };

    // Find nearest obstacle ahead
    let nearest: Obstacle | null = null;
    let nearestDist = Infinity;
    for (const obs of obstacles) {
      const dist = obs.sprite.x - DINO_X;
      if (dist > -20 && dist < nearestDist) {
        nearest = obs;
        nearestDist = dist;
      }
    }

    if (!nearest) return result;

    const timeMs = (nearestDist / speed) * 1000;

    if (timeMs < AUTOPLAY_REACT_MS) {
      if (nearest.kind === "bird-lo") {
        result.duck = true;
      } else {
        result.jump = true;
      }
    }

    return result;
  }
}
```

- [ ] **Step 2: Integrate into GameScene**

Add import and property:
```typescript
import { AutoPlayAI } from "../systems/AutoPlayAI";
// ...
private autoPlayAI!: AutoPlayAI;
private aKey!: Phaser.Input.Keyboard.Key;
```

In `create()`:
```typescript
this.autoPlayAI = new AutoPlayAI();
this.aKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
this.aKey.on("down", () => {
  this.autoPlayAI.togglePermanentMode();
});
```

In `update()` playing section, merge auto-play input:
```typescript
// Auto-play (temporary power-up or permanent mode)
const aiActive = this.activeAutoPlayTime > 0 || this.autoPlayAI.isActive;
if (aiActive) {
  const aiInput = this.autoPlayAI.decide(
    this.dino, this.obstacles, this.speed,
    this.platforms, this.collectibles, this.powerUps
  );
  if (aiInput.jump) this.dino.jump();
  this.dino.duck(aiInput.duck);
} else {
  // Normal input handling (existing code)
}

// Check for permanent unlock
this.autoPlayAI.checkUnlock(this.score);
```

- [ ] **Step 3: Verify**

Run: `npm run dev`
Expected: Auto-play power-up makes AI control dino for 10 seconds. After reaching 2500, pressing A toggles permanent auto-play mode.

- [ ] **Step 4: Commit**

```bash
git add src/systems/AutoPlayAI.ts src/scenes/GameScene.ts
git commit -m "feat: auto-play AI — temporary power-up and permanent unlock"
```

---

## Task 17: HUD and GameOverScreen

**Files:**
- Create: `src/ui/HUD.ts`, `src/ui/GameOverScreen.ts`
- Modify: `src/scenes/GameScene.ts`

- [ ] **Step 1: Create HUD**

```typescript
import Phaser from "phaser";
import { CANVAS_WIDTH } from "../config/constants";

export class HUD {
  private scene: Phaser.Scene;
  private scoreText: Phaser.GameObjects.Text;
  private hiScoreText: Phaser.GameObjects.Text;
  private powerUpText: Phaser.GameObjects.Text;
  private autoPlayText: Phaser.GameObjects.Text;
  private evolved = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Monochrome initially
    this.hiScoreText = scene.add.text(CANVAS_WIDTH - 10, 10, "", {
      fontSize: "14px", color: "#888888", fontFamily: "monospace",
    }).setOrigin(1, 0).setDepth(10);

    this.scoreText = scene.add.text(CANVAS_WIDTH - 10, 28, "00000", {
      fontSize: "14px", color: "#535353", fontFamily: "monospace",
    }).setOrigin(1, 0).setDepth(10);

    this.powerUpText = scene.add.text(10, 10, "", {
      fontSize: "12px", color: "#4488ff", fontFamily: "monospace",
    }).setDepth(10).setVisible(false);

    this.autoPlayText = scene.add.text(10, 28, "", {
      fontSize: "12px", color: "#44ff44", fontFamily: "monospace",
    }).setDepth(10).setVisible(false);
  }

  update(score: number, hiScore: number, activePowerUps: {
    shield: boolean;
    magnetTime: number;
    autoPlayTime: number;
  }, autoPlayPermanent: boolean): void {
    this.scoreText.setText(String(Math.floor(score)).padStart(5, "0"));
    if (hiScore > 0) {
      this.hiScoreText.setText("HI " + String(hiScore).padStart(5, "0"));
    }

    // Power-up indicators
    const parts: string[] = [];
    if (activePowerUps.shield) parts.push("SHIELD");
    if (activePowerUps.magnetTime > 0) parts.push(`MAGNET ${Math.ceil(activePowerUps.magnetTime / 1000)}s`);
    if (activePowerUps.autoPlayTime > 0) parts.push(`AI ${Math.ceil(activePowerUps.autoPlayTime / 1000)}s`);

    if (parts.length > 0) {
      this.powerUpText.setText(parts.join(" | ")).setVisible(true);
    } else {
      this.powerUpText.setVisible(false);
    }

    // Permanent auto-play indicator
    if (autoPlayPermanent) {
      this.autoPlayText.setText("AUTO-PLAY [A]").setVisible(true);
    } else {
      this.autoPlayText.setVisible(false);
    }
  }

  evolve(progress: number): void {
    if (progress >= 1 && !this.evolved) {
      this.evolved = true;
      this.scoreText.setColor("#ffffff").setFontSize("16px").setStroke("#000000", 3);
      this.hiScoreText.setColor("#cccccc").setFontSize("14px").setStroke("#000000", 2);
    }
  }
}
```

- [ ] **Step 2: Create GameOverScreen**

```typescript
import Phaser from "phaser";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../config/constants";

export class GameOverScreen {
  private container: Phaser.GameObjects.Container;
  private messageText: Phaser.GameObjects.Text;
  private scoreText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.messageText = scene.add.text(0, -20, "GAME OVER", {
      fontSize: "24px", color: "#535353", fontFamily: "monospace",
    }).setOrigin(0.5);

    this.scoreText = scene.add.text(0, 20, "", {
      fontSize: "14px", color: "#535353", fontFamily: "monospace",
    }).setOrigin(0.5);

    const restartText = scene.add.text(0, 50, "Press SPACE to restart", {
      fontSize: "12px", color: "#888888", fontFamily: "monospace",
    }).setOrigin(0.5);

    this.container = scene.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, [
      this.messageText, this.scoreText, restartText,
    ]);
    this.container.setDepth(10);
    this.container.setVisible(false);
  }

  show(score: number, isNewHiScore: boolean): void {
    this.scoreText.setText(
      `Score: ${Math.floor(score)}` + (isNewHiScore ? " NEW HI!" : "")
    );
    this.container.setVisible(true);
  }

  hide(): void {
    this.container.setVisible(false);
  }
}
```

- [ ] **Step 3: Refactor GameScene to use HUD and GameOverScreen**

Replace the inline score text and center text with the new HUD and GameOverScreen classes. Remove the old `scoreText`, `hiScoreText`, `centerText` properties and replace with:

```typescript
import { HUD } from "../ui/HUD";
import { GameOverScreen } from "../ui/GameOverScreen";
// ...
private hud!: HUD;
private gameOverScreen!: GameOverScreen;
private startText!: Phaser.GameObjects.Text;
```

In `create()`, replace old text setup:
```typescript
this.hud = new HUD(this);
this.gameOverScreen = new GameOverScreen(this);
this.startText = this.add.text(CANVAS_WIDTH / 2, 130, "Press SPACE to start", {
  fontSize: "16px", color: "#535353", fontFamily: "monospace",
}).setOrigin(0.5).setDepth(10);
```

In `update()` playing section:
```typescript
this.hud.update(this.score, this.hiScore, {
  shield: this.activeShield,
  magnetTime: this.activeMagnetTime,
  autoPlayTime: this.activeAutoPlayTime,
}, this.autoPlayAI.isActive);

// Evolve HUD
const colorProgress = this.phaseManager.colorProgress(this.score);
this.hud.evolve(colorProgress);
```

In `gameOver()`:
```typescript
const isNewHi = this.score > this.hiScore;
// ... save hi score ...
this.gameOverScreen.show(this.score, isNewHi);
```

In `resetGame()`:
```typescript
this.gameOverScreen.hide();
```

In `startGame()`:
```typescript
this.startText.setVisible(false);
```

- [ ] **Step 4: Verify**

Run: `npm run dev`
Expected: Score display works. Power-up indicators show when active. Game over screen shows score and "NEW HI!" when applicable. HUD style evolves after score 1000.

- [ ] **Step 5: Commit**

```bash
git add src/ui/HUD.ts src/ui/GameOverScreen.ts src/scenes/GameScene.ts
git commit -m "feat: HUD with power-up indicators and game over screen"
```

---

## Task 18: SEO Meta Tags

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add meta tags to index.html `<head>`**

Add after the viewport meta tag:

```html
<meta name="description" content="Think you know the Chrome dinosaur game? Think again. Play the browser game that transforms as you play.">
<meta name="theme-color" content="#f7f7f7">

<!-- Open Graph -->
<meta property="og:title" content="Dinosaur Jumper">
<meta property="og:description" content="The Chrome dino game... or is it? Play and find out.">
<meta property="og:type" content="website">
<meta property="og:image" content="./og-image.png">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Dinosaur Jumper">
<meta name="twitter:description" content="The Chrome dino game... or is it? Play and find out.">
<meta name="twitter:image" content="./og-image.png">

<!-- Accessibility -->
<noscript>
  <p style="text-align:center;padding:40px;font-family:sans-serif;">
    This game requires JavaScript to run. Please enable JavaScript in your browser.
  </p>
</noscript>
```

Update the `<title>`:
```html
<title>Dinosaur Jumper — The Browser Game That Evolves</title>
```

Add `aria-label` to body (Phaser appends canvas to body):
```html
<body aria-label="Dinosaur Jumper game">
```

- [ ] **Step 2: Verify**

Run: `npm run build && npm run preview`
Expected: Page title and meta tags visible in page source. OG tags present (og-image.png won't exist yet — that's a design asset to create later).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: SEO meta tags — OG, Twitter card, theme-color, noscript"
```

---

## Task 19: PWA Setup

**Files:**
- Create: `manifest.json`
- Modify: `vite.config.ts`, `index.html`

- [ ] **Step 1: Create manifest.json**

```json
{
  "name": "Dinosaur Jumper",
  "short_name": "DinoJumper",
  "description": "The Chrome dino game that evolves as you play",
  "start_url": "./",
  "display": "fullscreen",
  "background_color": "#f7f7f7",
  "theme_color": "#f7f7f7",
  "icons": [
    {
      "src": "./icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "./icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: Add vite-plugin-pwa to vite.config.ts**

```typescript
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: false, // Using external manifest.json
      workbox: {
        globPatterns: ["**/*.{js,css,html}"],
      },
    }),
  ],
});
```

- [ ] **Step 3: Link manifest in index.html**

Add to `<head>`:
```html
<link rel="manifest" href="./manifest.json">
<link rel="apple-touch-icon" href="./icon-192.png">
```

- [ ] **Step 4: Verify**

Run: `npm run build && npm run preview`
Expected: Service worker registers (check Chrome DevTools > Application > Service Workers). Manifest appears in Application > Manifest. (Icons won't load until created — placeholder is fine for now.)

- [ ] **Step 5: Commit**

```bash
git add manifest.json vite.config.ts index.html
git commit -m "feat: PWA setup — manifest, service worker via vite-plugin-pwa"
```

---

## Task 20: Polish and Final Verification

**Files:**
- Modify: `src/scenes/GameScene.ts`, `CLAUDE.md`

- [ ] **Step 1: Add depth ordering to all entities in GameScene**

Ensure all dynamically created sprites get proper depth:
- Obstacles: `setDepth(3)` — add in Obstacle constructor
- Clouds: `setDepth(1)`
- Collectibles and power-ups already have `setDepth(3)`

Add to Obstacle constructor:
```typescript
this.sprite.setDepth(3);
```

Add to cloud creation in `updateClouds()`:
```typescript
cloud.setDepth(1);
```

- [ ] **Step 2: Update CLAUDE.md**

Update the CLAUDE.md to reflect the new architecture:

```markdown
# CLAUDE.md

## Commands

\`\`\`bash
npm install          # install dependencies
npm run dev          # start Vite dev server with HMR
npm run build        # typecheck (tsc) then production build → dist/
npm run preview      # serve the production build locally
\`\`\`

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
```

- [ ] **Step 3: Full verification run**

Run: `npm run dev`

Test checklist:
1. Page loads with Chrome error page overlay
2. Space to start — classic dino gameplay (monochrome cacti)
3. Score 200+: ground tints, overlay starts fading
4. Score 400+: sky gradient appears
5. Score 600+: platforms spawn, dino can land on them
6. Score 800+: birds appear, parallax background visible
7. Score 1000+: overlay gone, full color
8. Score 1200+: coins spawn, collectible for bonus points
9. Score 1500+: power-ups spawn (shield/magnet/auto-play)
10. Score 2000+: lanes activate, up/down switches lanes
11. Score 2500+: permanent auto-play unlockable (A key)
12. Game over: shows score, hi-score persists
13. Mobile: tap to jump, swipe to duck (Chrome DevTools device mode)
14. Build: `npm run build` succeeds, `npm run preview` works

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: polish — depth ordering, updated CLAUDE.md, final verification"
```

---

## Summary

| Task | What it produces |
|------|-----------------|
| 1 | Project scaffolding — package.json, tsconfig, vite config |
| 2 | Game constants file |
| 3 | Minimal boot — Phaser canvas with stub scene |
| 4 | Procedural texture generation for all sprites |
| 5 | Dino entity with jump/duck/animation |
| 6 | Basic game loop — dino running on scrolling ground |
| 7 | Obstacles, collision, score tracking |
| 8 | Chrome error page overlay with fade |
| 9 | PhaseManager evolution event system |
| 10 | Visual evolution — sky gradient, parallax |
| 11 | Elevated platforms with landing |
| 12 | Collectible coins |
| 13 | Power-ups — shield, magnet, temporary auto-play |
| 14 | InputManager with touch controls |
| 15 | Lane switching system |
| 16 | Auto-play AI — temporary and permanent |
| 17 | HUD and game over screen |
| 18 | SEO meta tags |
| 19 | PWA setup |
| 20 | Polish and verification |
