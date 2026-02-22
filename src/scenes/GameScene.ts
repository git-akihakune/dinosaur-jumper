import Phaser from "phaser";

// ─── constants ────────────────────────────────────────────────────────────────

const W = 800;
const H = 300;
const GROUND_Y = 240;        // y of the ground surface
const DINO_X = 80;           // fixed horizontal position of dino
const INITIAL_SPEED = 350;   // px/s
const MAX_SPEED = 1200;
const ACCEL = 8;             // speed increase per second
const JUMP_VEL = -680;       // initial vertical velocity on jump
const GRAVITY = 2200;
const MIN_OBSTACLE_GAP = 350; // minimum px between obstacles (at spawn)
const MAX_OBSTACLE_GAP = 700;

// auto-play: react when obstacle is within this many ms of travel time
const AUTOPLAY_REACT_MS = 310;

// ─── types ────────────────────────────────────────────────────────────────────

type DinoFrame = "run1" | "run2" | "duck1" | "duck2" | "dead";
type ObstacleKind = "cactus-sm" | "cactus-md" | "cactus-lg" | "bird-lo" | "bird-hi";

interface ObstacleSpec {
  kind: ObstacleKind;
  x: number;
  /** left edge of collision box relative to sprite origin */
  hitX: number;
  hitW: number;
  hitY: number;
  hitH: number;
}

// ─── helpers to draw pixel sprites into textures ─────────────────────────────

function makeDinoTextures(scene: Phaser.Scene): void {
  const frames: Record<DinoFrame, () => void> = {
    run1: () => drawDino(scene, "dino-run1", false, false),
    run2: () => drawDino(scene, "dino-run2", false, true),
    duck1: () => drawDino(scene, "dino-duck1", true, false),
    duck2: () => drawDino(scene, "dino-duck2", true, true),
    dead: () => drawDino(scene, "dino-dead", false, false, true),
  };
  for (const fn of Object.values(frames)) fn();
}

/** Pixel-art T-Rex, 44×48 (standing) or 58×32 (ducking) */
function drawDino(
  scene: Phaser.Scene,
  key: string,
  ducking: boolean,
  altLeg: boolean,
  dead = false,
): void {
  const w = ducking ? 58 : 44;
  const h = ducking ? 32 : 48;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const col = dead ? 0xaaaaaa : 0x535353;
  const eye = dead ? 0x535353 : 0xf7f7f7;
  g.fillStyle(col);

  if (!ducking) {
    // body
    g.fillRect(8, 2, 28, 20);
    // head bump
    g.fillRect(18, 0, 18, 6);
    // eye socket
    g.fillStyle(0x535353);
    g.fillRect(30, 2, 10, 10);
    g.fillStyle(eye);
    g.fillRect(32, 4, 6, 6);
    // mouth / nostril area
    g.fillStyle(col);
    g.fillRect(34, 12, 8, 4);
    // neck / torso
    g.fillStyle(col);
    g.fillRect(6, 20, 28, 14);
    // back
    g.fillRect(0, 18, 10, 8);
    // tail
    g.fillRect(0, 10, 8, 10);
    // arms
    g.fillRect(18, 24, 8, 6);
    // legs
    if (!altLeg) {
      g.fillRect(10, 34, 8, 14);   // left leg down
      g.fillRect(22, 34, 8, 10);   // right leg up
    } else {
      g.fillRect(10, 34, 8, 10);   // left leg up
      g.fillRect(22, 34, 8, 14);   // right leg down
    }
  } else {
    // ducking body (wider, lower)
    g.fillStyle(col);
    g.fillRect(0, 6, 44, 16);      // body
    g.fillRect(36, 0, 18, 10);     // head
    g.fillRect(36, 10, 14, 6);     // neck joint
    // eye
    g.fillStyle(0x535353);
    g.fillRect(46, 2, 8, 8);
    g.fillStyle(eye);
    g.fillRect(48, 3, 5, 5);
    // tail
    g.fillStyle(col);
    g.fillRect(0, 2, 8, 10);
    // legs
    if (!altLeg) {
      g.fillRect(10, 22, 8, 10);
      g.fillRect(22, 22, 8, 6);
    } else {
      g.fillRect(10, 22, 8, 6);
      g.fillRect(22, 22, 8, 10);
    }
  }

  g.generateTexture(key, w, h);
  g.destroy();
}

function makeCactusTextures(scene: Phaser.Scene): void {
  // small single cactus
  {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0x535353);
    g.fillRect(8, 0, 8, 50);   // stem
    g.fillRect(0, 14, 8, 6);   // left arm
    g.fillRect(0, 8, 4, 14);   // left arm stem
    g.fillRect(16, 18, 8, 6);  // right arm
    g.fillRect(20, 12, 4, 14); // right arm stem
    g.generateTexture("cactus-sm", 24, 50);
    g.destroy();
  }
  // medium — two cacti together
  {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0x535353);
    // left cactus
    g.fillRect(4, 0, 10, 60);
    g.fillRect(0, 18, 6, 8);
    g.fillRect(0, 10, 4, 16);
    g.fillRect(14, 22, 6, 8);
    g.fillRect(16, 14, 4, 16);
    // right cactus
    g.fillRect(22, 6, 10, 54);
    g.fillRect(18, 24, 6, 8);
    g.fillRect(18, 16, 4, 16);
    g.fillRect(32, 20, 6, 8);
    g.fillRect(34, 12, 4, 16);
    g.generateTexture("cactus-md", 40, 60);
    g.destroy();
  }
  // large — three cacti
  {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0x535353);
    // left
    g.fillRect(2, 4, 10, 66);
    g.fillRect(0, 22, 4, 10);
    g.fillRect(12, 28, 4, 10);
    // mid
    g.fillRect(18, 0, 12, 70);
    g.fillRect(14, 20, 6, 10);
    g.fillRect(30, 24, 6, 10);
    // right
    g.fillRect(38, 4, 10, 66);
    g.fillRect(34, 22, 6, 10);
    g.fillRect(48, 28, 4, 10);
    g.generateTexture("cactus-lg", 52, 70);
    g.destroy();
  }
}

function makeBirdTextures(scene: Phaser.Scene): void {
  for (const alt of [false, true]) {
    const key = alt ? "bird2" : "bird1";
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0x535353);
    // body
    g.fillRect(10, 8, 26, 12);
    // head
    g.fillRect(32, 4, 10, 10);
    // beak
    g.fillRect(42, 7, 8, 4);
    // eye
    g.fillStyle(0xf7f7f7);
    g.fillRect(36, 5, 4, 4);
    g.fillStyle(0x535353);
    g.fillRect(37, 6, 2, 2);
    // tail
    g.fillStyle(0x535353);
    g.fillRect(4, 10, 8, 6);
    g.fillRect(0, 12, 6, 4);
    // wings
    if (!alt) {
      // wings up
      g.fillRect(12, 0, 20, 8);
      g.fillRect(14, 20, 18, 6);
    } else {
      // wings down
      g.fillRect(12, 14, 20, 8);
      g.fillRect(10, 22, 22, 6);
    }
    g.generateTexture(key, 50, 30);
    g.destroy();
  }
}

function makeCloudTexture(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xe0e0e0);
  g.fillRect(20, 10, 60, 14);
  g.fillRect(10, 16, 80, 10);
  g.fillRect(0, 20, 100, 8);
  g.fillRect(30, 4, 40, 10);
  g.fillRect(50, 0, 20, 8);
  g.generateTexture("cloud", 100, 30);
  g.destroy();
}

function makeGroundTexture(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0x535353);
  // main ground line
  g.fillRect(0, 0, W * 2, 4);
  // scatter some pebbles
  const pebbles = [
    [20, 6, 4, 2], [80, 8, 2, 2], [150, 5, 6, 3], [210, 7, 3, 2],
    [300, 6, 5, 2], [370, 8, 2, 3], [430, 5, 4, 2], [500, 7, 6, 2],
    [560, 6, 3, 3], [620, 5, 5, 2], [700, 8, 2, 2], [760, 6, 4, 3],
    [820, 5, 3, 2], [900, 7, 6, 2], [960, 6, 2, 3], [1020, 5, 4, 2],
    [1100, 8, 3, 2], [1180, 6, 5, 3], [1250, 7, 2, 2], [1380, 5, 6, 2],
    [1450, 6, 4, 3], [1520, 8, 2, 2], [1580, 5, 5, 2], [1650, 7, 3, 3],
  ];
  for (const [x, y, w, h] of pebbles) g.fillRect(x, y, w, h);
  g.generateTexture("ground", W * 2, 16);
  g.destroy();
}

// ─── GameScene ────────────────────────────────────────────────────────────────

export class GameScene extends Phaser.Scene {
  // dino
  private dino!: Phaser.GameObjects.Image;
  private dinoVelY = 0;
  private dinoOnGround = true;
  private ducking = false;
  private dinoFrameTimer = 0;
  private dinoFrameAlt = false;

  // ground
  private ground1!: Phaser.GameObjects.Image;
  private ground2!: Phaser.GameObjects.Image;

  // obstacles
  private obstacles: ObstacleSpec[] = [];
  private obstacleImages: Phaser.GameObjects.Image[] = [];
  private nextObstacleX = W + 200;

  // clouds
  private clouds: Phaser.GameObjects.Image[] = [];
  private nextCloudX = W + 100;

  // game state
  private speed = INITIAL_SPEED;
  private score = 0;
  private hiScore = 0;
  private state: "idle" | "playing" | "dead" = "idle";

  // auto-play
  private autoPlay = false;

  // ui
  private scoreTxt!: Phaser.GameObjects.Text;
  private hiScoreTxt!: Phaser.GameObjects.Text;
  private msgTxt!: Phaser.GameObjects.Text;
  private autoBtn!: Phaser.GameObjects.Text;

  // input
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private upKey!: Phaser.Input.Keyboard.Key;
  private downKey!: Phaser.Input.Keyboard.Key;
  private aKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super("GameScene");
  }

  preload(): void {
    // all textures generated programmatically in create()
  }

  create(): void {
    // build textures
    makeDinoTextures(this);
    makeCactusTextures(this);
    makeBirdTextures(this);
    makeCloudTexture(this);
    makeGroundTexture(this);

    // ground tiles
    this.ground1 = this.add.image(0, GROUND_Y + 4, "ground").setOrigin(0, 0);
    this.ground2 = this.add.image(W * 2, GROUND_Y + 4, "ground").setOrigin(0, 0);

    // dino
    this.dino = this.add.image(DINO_X, GROUND_Y - 48, "dino-run1").setOrigin(0, 1);

    // score
    this.scoreTxt = this.add
      .text(W - 20, 20, "00000", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#535353",
      })
      .setOrigin(1, 0);

    this.hiScoreTxt = this.add
      .text(W - 130, 20, "HI 00000", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#aaaaaa",
      })
      .setOrigin(1, 0);

    // center message
    this.msgTxt = this.add
      .text(W / 2, H / 2, "Press  SPACE  or  ↑  to Start", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#535353",
      })
      .setOrigin(0.5);

    // auto-play button (top-left)
    this.autoBtn = this.add
      .text(16, 20, "[ A ] Auto-play: OFF", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#aaaaaa",
      })
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.toggleAutoPlay());

    // input
    const kb = this.input.keyboard!;
    this.spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.upKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.aKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);

    this.aKey.on("down", () => this.toggleAutoPlay());
  }

  private toggleAutoPlay(): void {
    this.autoPlay = !this.autoPlay;
    this.autoBtn.setText(`[ A ] Auto-play: ${this.autoPlay ? "ON " : "OFF"}`);
    this.autoBtn.setColor(this.autoPlay ? "#2a7a2a" : "#aaaaaa");
  }

  private startGame(): void {
    this.state = "playing";
    this.speed = INITIAL_SPEED;
    this.score = 0;
    this.dinoVelY = 0;
    this.dinoOnGround = true;
    this.ducking = false;
    this.dinoFrameTimer = 0;
    this.dinoFrameAlt = false;
    this.nextObstacleX = W + Phaser.Math.Between(200, 500);

    // clear old obstacles
    for (const img of this.obstacleImages) img.destroy();
    this.obstacleImages = [];
    this.obstacles = [];

    // clear old clouds
    for (const c of this.clouds) c.destroy();
    this.clouds = [];
    this.nextCloudX = W + 100;

    this.dino.setTexture("dino-run1").setY(GROUND_Y - 48).setVisible(true);
    this.msgTxt.setVisible(false);
  }

  private jump(): void {
    if (!this.dinoOnGround || this.state !== "playing") return;
    this.dinoVelY = JUMP_VEL;
    this.dinoOnGround = false;
  }

  private die(): void {
    this.state = "dead";
    if (this.score > this.hiScore) this.hiScore = this.score;
    this.dino.setTexture("dino-dead");
    this.msgTxt
      .setText("GAME OVER\n\nPress  SPACE  or  ↑  to Restart")
      .setVisible(true);
  }

  // ─── auto-play AI ──────────────────────────────────────────────────────────

  private autoPlayDecide(): void {
    if (!this.autoPlay || this.state !== "playing" || !this.dinoOnGround) return;

    // find the nearest obstacle ahead of the dino's right edge
    const dinoRight = DINO_X + 44;
    let nearest: ObstacleSpec | null = null;
    for (const obs of this.obstacles) {
      const obsLeft = obs.x + obs.hitX;
      if (obsLeft > dinoRight) {
        if (!nearest || obsLeft < nearest.x + nearest.hitX) nearest = obs;
      }
    }
    if (!nearest) return;

    const obsLeft = nearest.x + nearest.hitX;
    const gap = obsLeft - dinoRight;
    // time in ms until the obstacle reaches the dino at current speed
    const timeMs = (gap / this.speed) * 1000;

    if (timeMs < AUTOPLAY_REACT_MS) {
      this.jump();
    }
  }

  // ─── update ────────────────────────────────────────────────────────────────

  override update(_time: number, delta: number): void {
    const dt = delta / 1000; // seconds

    // idle / dead → wait for start/restart input
    if (this.state === "idle" || this.state === "dead") {
      const jumpPressed =
        Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
        Phaser.Input.Keyboard.JustDown(this.upKey);

      if (jumpPressed) {
        if (this.state === "idle" || this.state === "dead") {
          this.startGame();
        }
      }
      // allow auto-play to restart too
      if (this.state === "dead" && this.autoPlay) {
        this.startGame();
      }
      return;
    }

    // ── speed up ─────────────────────────────────────────────────────────────
    this.speed = Math.min(this.speed + ACCEL * dt * 60 * dt, MAX_SPEED);

    // ── score ─────────────────────────────────────────────────────────────────
    this.score += dt * this.speed * 0.015;
    const scoreInt = Math.floor(this.score);
    this.scoreTxt.setText(String(scoreInt).padStart(5, "0"));
    this.hiScoreTxt.setText("HI " + String(this.hiScore).padStart(5, "0"));

    // ── input / auto-play ─────────────────────────────────────────────────────
    this.autoPlayDecide();

    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
      Phaser.Input.Keyboard.JustDown(this.upKey);
    if (jumpPressed && !this.autoPlay) this.jump();

    this.ducking =
      !this.autoPlay &&
      (this.downKey.isDown || false);

    // ── dino physics ──────────────────────────────────────────────────────────
    if (!this.dinoOnGround) {
      this.dinoVelY += GRAVITY * dt;
      const dinoH = this.ducking ? 32 : 48;
      let newY = this.dino.y + this.dinoVelY * dt;
      const groundLimit = GROUND_Y - dinoH;
      if (newY >= groundLimit) {
        newY = groundLimit;
        this.dinoVelY = 0;
        this.dinoOnGround = true;
      }
      this.dino.setY(newY);
    }

    // ── dino animation ────────────────────────────────────────────────────────
    if (this.dinoOnGround) {
      this.dinoFrameTimer += dt;
      if (this.dinoFrameTimer > 0.1) {
        this.dinoFrameTimer = 0;
        this.dinoFrameAlt = !this.dinoFrameAlt;
        if (this.ducking) {
          this.dino.setTexture(this.dinoFrameAlt ? "dino-duck2" : "dino-duck1");
          this.dino.setY(GROUND_Y - 32);
        } else {
          this.dino.setTexture(this.dinoFrameAlt ? "dino-run2" : "dino-run1");
          this.dino.setY(GROUND_Y - 48);
        }
      }
    } else {
      this.dino.setTexture("dino-run1");
    }

    // ── scroll ground ─────────────────────────────────────────────────────────
    this.ground1.x -= this.speed * dt;
    this.ground2.x -= this.speed * dt;
    if (this.ground1.x + W * 2 < 0) this.ground1.x += W * 4;
    if (this.ground2.x + W * 2 < 0) this.ground2.x += W * 4;

    // ── clouds ────────────────────────────────────────────────────────────────
    this.nextCloudX -= this.speed * dt * 0.3;
    if (this.nextCloudX < W) {
      const y = Phaser.Math.Between(40, 120);
      const cloud = this.add.image(W + 50, y, "cloud").setOrigin(0, 0).setAlpha(0.6);
      this.clouds.push(cloud);
      this.nextCloudX = W + Phaser.Math.Between(200, 500);
    }
    for (let i = this.clouds.length - 1; i >= 0; i--) {
      this.clouds[i].x -= this.speed * dt * 0.3;
      if (this.clouds[i].x < -120) {
        this.clouds[i].destroy();
        this.clouds.splice(i, 1);
      }
    }

    // ── spawn obstacles ───────────────────────────────────────────────────────
    this.nextObstacleX -= this.speed * dt;
    if (this.nextObstacleX < W) {
      this.spawnObstacle();
      const gap = Phaser.Math.Between(MIN_OBSTACLE_GAP, MAX_OBSTACLE_GAP);
      this.nextObstacleX = W + gap;
    }

    // ── move + cull obstacles ────────────────────────────────────────────────
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.speed * dt;
      this.obstacleImages[i].x = obs.x;
      if (obs.x + obs.hitX + obs.hitW < 0) {
        this.obstacleImages[i].destroy();
        this.obstacleImages.splice(i, 1);
        this.obstacles.splice(i, 1);
      }
    }

    // ── collision ─────────────────────────────────────────────────────────────
    if (this.checkCollision()) {
      this.die();
    }
  }

  // ─── obstacle spawning ─────────────────────────────────────────────────────

  private spawnObstacle(): void {
    // pick kind; at higher speeds introduce birds more often
    const speedFrac = (this.speed - INITIAL_SPEED) / (MAX_SPEED - INITIAL_SPEED);
    const birdChance = speedFrac * 0.35; // 0–35 %
    const rng = Math.random();

    let kind: ObstacleKind;
    if (rng < birdChance) {
      kind = Math.random() < 0.5 ? "bird-lo" : "bird-hi";
    } else if (rng < birdChance + 0.33) {
      kind = "cactus-sm";
    } else if (rng < birdChance + 0.66) {
      kind = "cactus-md";
    } else {
      kind = "cactus-lg";
    }

    let textureKey: string;
    let groundOffset: number; // y from GROUND_Y (negative = above ground)
    let hitX: number, hitY: number, hitW: number, hitH: number;
    let imgH: number;

    switch (kind) {
      case "cactus-sm":
        textureKey = "cactus-sm";
        imgH = 50;
        groundOffset = -imgH;
        hitX = 4; hitW = 16; hitY = 4; hitH = 46;
        break;
      case "cactus-md":
        textureKey = "cactus-md";
        imgH = 60;
        groundOffset = -imgH;
        hitX = 2; hitW = 36; hitY = 4; hitH = 56;
        break;
      case "cactus-lg":
        textureKey = "cactus-lg";
        imgH = 70;
        groundOffset = -imgH;
        hitX = 2; hitW = 48; hitY = 4; hitH = 66;
        break;
      case "bird-lo":
        textureKey = "bird1";
        imgH = 30;
        groundOffset = -50; // low bird, just above ground — must duck
        hitX = 6; hitW = 38; hitY = 4; hitH = 22;
        break;
      case "bird-hi":
        textureKey = "bird1";
        imgH = 30;
        groundOffset = -110; // high bird — can run under
        hitX = 6; hitW = 38; hitY = 4; hitH = 22;
        break;
    }

    const x = W + 40;
    const y = GROUND_Y + groundOffset!;
    const img = this.add.image(x, y, textureKey!).setOrigin(0, 0);

    this.obstacles.push({ kind, x, hitX: hitX!, hitW: hitW!, hitY: hitY!, hitH: hitH! });
    this.obstacleImages.push(img);

    // animate birds
    if (kind === "bird-lo" || kind === "bird-hi") {
      this.tweens.add({
        targets: img,
        // no movement tween needed — x driven in update; just wing flap via texture swap
      });
      this.time.addEvent({
        delay: 150,
        loop: true,
        callback: () => {
          if (!img.active) return;
          img.setTexture(img.texture.key === "bird1" ? "bird2" : "bird1");
        },
      });
    }
  }

  // ─── collision detection ───────────────────────────────────────────────────

  private checkCollision(): boolean {
    const dinoTop = this.dino.y - (this.ducking ? 32 : 48);
    const dinoBottom = this.dino.y;
    const dinoLeft = DINO_X + 6;
    const dinoRight = DINO_X + 38;

    for (const obs of this.obstacles) {
      const oLeft = obs.x + obs.hitX;
      const oRight = oLeft + obs.hitW;
      const oTop = GROUND_Y + (/* groundOffset based on hitY */
        (() => {
          switch (obs.kind) {
            case "cactus-sm": return -50 + obs.hitY;
            case "cactus-md": return -60 + obs.hitY;
            case "cactus-lg": return -70 + obs.hitY;
            case "bird-lo":   return -50 + obs.hitY;
            case "bird-hi":   return -110 + obs.hitY;
          }
        })()
      );
      const oBottom = oTop + obs.hitH;

      if (
        dinoRight > oLeft &&
        dinoLeft < oRight &&
        dinoBottom > oTop &&
        dinoTop < oBottom
      ) {
        return true;
      }
    }
    return false;
  }
}
