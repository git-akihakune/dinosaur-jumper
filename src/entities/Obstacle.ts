import Phaser from "phaser";
import {
  GROUND_Y,
  CACTUS_SM, CACTUS_MD, CACTUS_LG, BIRD_SIZE,
} from "../config/constants";
import { AABB } from "../systems/Physics";

export type ObstacleKind = "cactus-sm" | "cactus-md" | "cactus-lg" | "bird-lo" | "bird-hi";

interface ObstacleSpec {
  texture: string;
  width: number;
  height: number;
  yOffset: number;
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

  private birdAnimTimer = 0;
  private birdFrame = 0;

  constructor(scene: Phaser.Scene, kind: ObstacleKind, x: number) {
    this.kind = kind;
    this.spec = SPECS[kind];

    const y = GROUND_Y - this.spec.yOffset;
    this.sprite = scene.add.sprite(x, y, this.spec.texture).setOrigin(0, 0);
    this.sprite.setDepth(3);
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
