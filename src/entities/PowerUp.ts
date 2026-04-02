import Phaser from "phaser";
import { GROUND_Y, AUTOPLAY_POWERUP_DURATION, MAGNET_DURATION } from "../config/constants";
import { AABB } from "../systems/Physics";

export type PowerUpType = "shield" | "magnet" | "autoplay";

const DURATIONS: Record<PowerUpType, number> = {
  shield: 0, // lasts until hit
  magnet: MAGNET_DURATION,
  autoplay: AUTOPLAY_POWERUP_DURATION,
};

const TEXTURES: Record<PowerUpType, string> = {
  shield: "powerup-shield",
  magnet: "powerup-magnet",
  autoplay: "powerup-autoplay",
};

export class PowerUp {
  sprite: Phaser.GameObjects.Image;
  type: PowerUpType;
  collected = false;

  constructor(scene: Phaser.Scene, x: number, type: PowerUpType, y?: number) {
    this.type = type;
    const posY = y ?? GROUND_Y - 28;
    this.sprite = scene.add.image(x, posY, TEXTURES[type]).setOrigin(0, 0);
    this.sprite.setDepth(3);
  }

  get hitbox(): AABB {
    return { x: this.sprite.x, y: this.sprite.y, w: 20, h: 20 };
  }

  get duration(): number {
    return DURATIONS[this.type];
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
