import Phaser from "phaser";
import { PLATFORM_WIDTH } from "../config/constants";
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
      h: 6,
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
