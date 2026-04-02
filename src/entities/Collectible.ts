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
