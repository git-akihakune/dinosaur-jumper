import Phaser from "phaser";
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, INITIAL_SPEED, MAX_SPEED, SPEED_ACCEL, MIN_OBSTACLE_GAP, MAX_OBSTACLE_GAP } from "../config/constants";
import { TextureGen } from "../graphics/TextureGen";
import { Dino } from "../entities/Dino";
import { Obstacle } from "../entities/Obstacle";
import { aabbOverlap } from "../systems/Physics";
import { ChromeOverlay } from "../ui/ChromeOverlay";
import { PhaseManager } from "../systems/PhaseManager";
import { Platform } from "../entities/Platform";
import { Collectible } from "../entities/Collectible";
import { PowerUp, PowerUpType } from "../entities/PowerUp";
import { InputManager } from "../systems/InputManager";

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
  private inputManager!: InputManager;

  // Center message
  private centerText!: Phaser.GameObjects.Text;

  // Obstacles
  private obstacles: Obstacle[] = [];
  private distSinceLastObstacle = 0;
  private nextObstacleGap = MIN_OBSTACLE_GAP;

  // Score display
  private hiScore = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private hiScoreText!: Phaser.GameObjects.Text;
  private chromeOverlay!: ChromeOverlay;
  private phaseManager!: PhaseManager;

  // Visual evolution
  private skyGradient!: Phaser.GameObjects.Graphics;
  private parallaxLayers: Phaser.GameObjects.Image[] = [];

  // Platforms
  private platforms: Platform[] = [];
  private platformsUnlocked = false;
  private distSinceLastPlatform = 0;

  // Collectibles
  private collectibles: Collectible[] = [];
  private collectiblesUnlocked = false;
  private distSinceLastCollectible = 0;

  // Power-ups
  private powerUps: PowerUp[] = [];
  private powerUpsUnlocked = false;
  private distSinceLastPowerUp = 0;
  private activeShield = false;
  private activeMagnetTime = 0;
  private activeAutoPlayTime = 0;
  private shieldIndicator?: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    this.textureGen = new TextureGen(this);
    this.textureGen.generate();
    this.textureGen.generatePlatform();
    this.textureGen.generateCollectible();
    this.textureGen.generatePowerUps();

    // Sky gradient (hidden initially)
    this.skyGradient = this.add.graphics();
    this.skyGradient.setAlpha(0);

    // Ground
    this.ground1 = this.add.image(0, GROUND_Y, "ground").setOrigin(0, 0);
    this.ground2 = this.add.image(2400, GROUND_Y, "ground").setOrigin(0, 0);

    // Dino
    this.dino = new Dino(this);

    // Input
    this.inputManager = new InputManager(this);

    // Score display
    this.hiScore = parseInt(localStorage.getItem("hiScore") || "0", 10);
    this.hiScoreText = this.add.text(CANVAS_WIDTH - 10, 10, "", {
      fontSize: "14px", color: "#888888", fontFamily: "monospace",
    }).setOrigin(1, 0);
    this.scoreText = this.add.text(CANVAS_WIDTH - 10, 28, "00000", {
      fontSize: "14px", color: "#535353", fontFamily: "monospace",
    }).setOrigin(1, 0);

    // Center text
    this.centerText = this.add.text(CANVAS_WIDTH / 2, 130, "Press SPACE to start", {
      fontSize: "16px",
      color: "#535353",
      fontFamily: "monospace",
    }).setOrigin(0.5);

    this.chromeOverlay = new ChromeOverlay();
    this.phaseManager = new PhaseManager();
    this.phaseManager.on("unlock:skyColor", () => {
      this.createParallaxLayers();
    });
    this.phaseManager.on("unlock:platforms", () => {
      this.platformsUnlocked = true;
    });
    this.phaseManager.on("unlock:collectibles", () => {
      this.collectiblesUnlocked = true;
    });
    this.phaseManager.on("unlock:powerups", () => {
      this.powerUpsUnlocked = true;
    });
    this.phaseManager.on("unlock:lanes", () => {
      this.inputManager.unlockLanes();
      this.dino.enableLanes();
    });

    this.resetGame();
  }

  override update(_time: number, delta: number): void {
    const dt = delta / 1000;

    if (this.gameState === "idle") {
      if (this.inputManager.isStartPressed()) {
        this.startGame();
      }
      return;
    }

    if (this.gameState === "dead") {
      if (this.inputManager.isStartPressed()) {
        this.resetGame();
        this.startGame();
      }
      return;
    }

    // --- Playing ---

    // Input
    const input = this.inputManager.getState();
    if (this.phaseManager.isUnlocked("unlock:lanes")) {
      if (input.laneUp) this.dino.switchLane("up");
      if (input.laneDown) this.dino.switchLane("down");
    } else {
      if (input.jump) this.dino.jump();
      this.dino.duck(input.duck);
    }

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

    // Obstacles
    this.spawnObstacles(dt);
    this.updateObstacles(dt);
    this.checkCollisions();

    // Platforms
    this.spawnPlatforms(dt);
    this.updatePlatforms(dt);

    // Collectibles
    this.spawnCollectibles(dt);
    this.updateCollectibles(dt);

    // Power-ups
    this.spawnPowerUps(dt);
    this.updatePowerUps(dt);

    // Score display
    this.scoreText.setText(String(Math.floor(this.score)).padStart(5, "0"));
    if (this.hiScore > 0) {
      this.hiScoreText.setText("HI " + String(this.hiScore).padStart(5, "0"));
    }
    // Visual evolution
    const colorProgress = this.phaseManager.colorProgress(this.score);
    if (colorProgress > 0) {
      this.updateSkyGradient(colorProgress);
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

    this.chromeOverlay.update(this.score);
    this.phaseManager.update(this.score);
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
    this.distSinceLastObstacle = 0;
    this.dino.reset();
    for (const obs of this.obstacles) obs.destroy();
    this.obstacles = [];
    for (const p of this.platforms) p.destroy();
    this.platforms = [];
    this.platformsUnlocked = false;
    this.distSinceLastPlatform = 0;
    for (const c of this.collectibles) c.destroy();
    this.collectibles = [];
    this.collectiblesUnlocked = false;
    this.distSinceLastCollectible = 0;
    for (const pu of this.powerUps) pu.destroy();
    this.powerUps = [];
    this.powerUpsUnlocked = false;
    this.distSinceLastPowerUp = 0;
    this.activeShield = false;
    this.activeMagnetTime = 0;
    this.activeAutoPlayTime = 0;
    if (this.shieldIndicator) { this.shieldIndicator.destroy(); this.shieldIndicator = undefined; }
    this.centerText.setText("Press SPACE to start").setVisible(true);
    this.phaseManager.reset();
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

  private spawnCollectibles(dt: number): void {
    if (!this.collectiblesUnlocked) return;
    this.distSinceLastCollectible += this.speed * dt;
    if (this.distSinceLastCollectible >= Phaser.Math.Between(200, 500)) {
      this.distSinceLastCollectible = 0;
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

      // Magnet effect
      if (this.activeMagnetTime > 0) {
        const dx = this.dino.x - c.sprite.x;
        const dy = this.dino.y - c.sprite.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          c.sprite.x += dx * 3 * dt;
          c.sprite.y += dy * 3 * dt;
        }
      }

      if (!c.collected && aabbOverlap(dinoBox, c.hitbox)) {
        c.collect();
        this.score += 10;
        this.collectibles.splice(i, 1);
      } else if (c.isOffScreen()) {
        c.destroy();
        this.collectibles.splice(i, 1);
      }
    }
  }

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

    // Decrement timers
    if (this.activeMagnetTime > 0) this.activeMagnetTime -= dt * 1000;
    if (this.activeAutoPlayTime > 0) this.activeAutoPlayTime -= dt * 1000;

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

  private updateSkyGradient(progress: number): void {
    this.skyGradient.clear();
    this.skyGradient.setAlpha(progress);

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

  private createParallaxLayers(): void {
    const g = this.add.graphics();
    g.fillStyle(0xbbbbbb, 0.3);
    g.fillTriangle(0, 200, 100, 80, 200, 200);
    g.fillTriangle(150, 200, 280, 60, 410, 200);
    g.fillTriangle(350, 200, 500, 100, 650, 200);
    g.fillTriangle(550, 200, 700, 70, 850, 200);
    g.generateTexture("parallax-bg", CANVAS_WIDTH, CANVAS_HEIGHT);
    g.destroy();

    const bg1 = this.add.image(0, 0, "parallax-bg").setOrigin(0, 0).setAlpha(0);
    const bg2 = this.add.image(CANVAS_WIDTH, 0, "parallax-bg").setOrigin(0, 0).setAlpha(0);
    this.parallaxLayers = [bg1, bg2];

    // Depth ordering
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

  private gameOver(): void {
    this.gameState = "dead";
    this.dino.die();
    if (this.score > this.hiScore) {
      this.hiScore = Math.floor(this.score);
      localStorage.setItem("hiScore", String(this.hiScore));
    }
    this.centerText.setText("GAME OVER - Press SPACE").setVisible(true);
  }
}
