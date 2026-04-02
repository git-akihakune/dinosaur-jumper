import Phaser from "phaser";
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, INITIAL_SPEED, MAX_SPEED, SPEED_ACCEL, MIN_OBSTACLE_GAP, MAX_OBSTACLE_GAP } from "../config/constants";
import { TextureGen } from "../graphics/TextureGen";
import { Dino } from "../entities/Dino";
import { Obstacle } from "../entities/Obstacle";
import { aabbOverlap } from "../systems/Physics";
import { ChromeOverlay } from "../ui/ChromeOverlay";
import { PhaseManager } from "../systems/PhaseManager";

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

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    this.textureGen = new TextureGen(this);
    this.textureGen.generate();

    // Sky gradient (hidden initially)
    this.skyGradient = this.add.graphics();
    this.skyGradient.setAlpha(0);

    // Ground
    this.ground1 = this.add.image(0, GROUND_Y, "ground").setOrigin(0, 0);
    this.ground2 = this.add.image(2400, GROUND_Y, "ground").setOrigin(0, 0);

    // Dino
    this.dino = new Dino(this);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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

    this.resetGame();
  }

  override update(_time: number, delta: number): void {
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

    // Obstacles
    this.spawnObstacles(dt);
    this.updateObstacles(dt);
    this.checkCollisions();

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
        this.gameOver();
        return;
      }
    }
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
