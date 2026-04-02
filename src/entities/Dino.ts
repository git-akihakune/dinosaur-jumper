import Phaser from "phaser";
import {
  DINO_X, DINO_WIDTH, DINO_HEIGHT, DINO_DUCK_HEIGHT,
  GROUND_Y, GRAVITY, JUMP_VELOCITY, LANE_COUNT, LANE_POSITIONS,
} from "../config/constants";

export type DinoState = "idle" | "running" | "jumping" | "ducking" | "dead";

export class Dino {
  sprite: Phaser.GameObjects.Sprite;
  state: DinoState = "idle";
  velocityY = 0;
  isOnGround = true;

  private animTimer = 0;
  private animFrame = 0;
  private readonly ANIM_INTERVAL = 100;

  // Lane system
  private currentLane = 2;
  private lanesActive = false;

  constructor(scene: Phaser.Scene) {
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

  get lane(): number { return this.currentLane; }

  get targetY(): number {
    if (!this.lanesActive) return GROUND_Y;
    return LANE_POSITIONS[this.currentLane];
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
    this.currentLane = 2;
    this.lanesActive = false;
    this.sprite.setPosition(DINO_X, GROUND_Y - DINO_HEIGHT);
    this.sprite.setTexture("dino-run1");
  }

  enableLanes(): void {
    this.lanesActive = true;
    this.currentLane = 2;
  }

  switchLane(direction: "up" | "down"): void {
    if (!this.lanesActive || this.state === "dead") return;
    if (direction === "up" && this.currentLane > 0) {
      this.currentLane--;
    } else if (direction === "down" && this.currentLane < LANE_COUNT - 1) {
      this.currentLane++;
    }
  }

  landOnPlatform(platformY: number): void {
    if (this.velocityY > 0 && this.sprite.y + this.height <= platformY + 10) {
      this.sprite.y = platformY - this.height;
      this.velocityY = 0;
      this.isOnGround = true;
      this.state = "running";
    }
  }

  checkFalling(platforms: Array<{ hitbox: { x: number; y: number; w: number; h: number }; topY: number }>): void {
    if (this.state === "dead" || !this.isOnGround || this.sprite.y >= GROUND_Y - DINO_HEIGHT) return;

    const dinoBottom = this.sprite.y + this.height;
    const dinoLeft = this.sprite.x;
    const dinoRight = this.sprite.x + this.width;

    for (const p of platforms) {
      if (dinoLeft < p.hitbox.x + p.hitbox.w &&
          dinoRight > p.hitbox.x &&
          Math.abs(dinoBottom - p.topY) < 4) {
        return;
      }
    }

    this.isOnGround = false;
    this.state = "jumping";
  }

  update(dt: number): void {
    if (this.state === "dead" || this.state === "idle") return;

    // Gravity
    if (!this.isOnGround) {
      this.velocityY += GRAVITY * dt;
      this.sprite.y += this.velocityY * dt;

      if (this.sprite.y >= GROUND_Y - DINO_HEIGHT) {
        this.sprite.y = GROUND_Y - DINO_HEIGHT;
        this.velocityY = 0;
        this.isOnGround = true;
        this.state = "running";
      }
    }

    // Lane movement (when active)
    if (this.lanesActive && this.isOnGround) {
      const targetY = LANE_POSITIONS[this.currentLane] - this.height;
      const diff = targetY - this.sprite.y;
      if (Math.abs(diff) > 1) {
        this.sprite.y += diff * 8 * dt;
      } else {
        this.sprite.y = targetY;
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
    } else if (this.isOnGround && this.state === "running" && !this.lanesActive) {
      this.sprite.y = GROUND_Y - DINO_HEIGHT;
    }
  }
}
