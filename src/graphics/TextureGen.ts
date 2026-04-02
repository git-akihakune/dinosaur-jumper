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
      g.fillRect(8, 0, 28, 32);
      g.fillRect(20, 0, 24, 20);
      g.fillStyle(0xffffff);
      g.fillRect(34, 4, 6, 6);
      g.fillStyle(c);
      g.fillRect(12, 32, 8, 16);
      g.fillRect(28, 32, 8, 12);
      g.fillRect(0, 8, 10, 8);
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
    this.drawTexture("bird1", BIRD_SIZE.width, BIRD_SIZE.height, (g) => {
      g.fillStyle(c);
      g.fillRect(0, 14, 50, 6);
      g.fillRect(10, 4, 8, 10);
      g.fillRect(18, 0, 8, 14);
    });

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
      g.fillRect(4, 4, 4, PLATFORM_HEIGHT - 4);
      g.fillRect(PLATFORM_WIDTH - 8, 4, 4, PLATFORM_HEIGHT - 4);
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
    this.drawTexture("powerup-shield", 20, 20, (g) => {
      g.fillStyle(0x4488ff);
      g.fillRect(4, 0, 12, 4);
      g.fillRect(0, 4, 20, 8);
      g.fillRect(2, 12, 16, 4);
      g.fillRect(6, 16, 8, 4);
    });

    this.drawTexture("powerup-magnet", 20, 20, (g) => {
      g.fillStyle(0xff4444);
      g.fillRect(2, 0, 6, 14);
      g.fillRect(12, 0, 6, 14);
      g.fillStyle(0x888888);
      g.fillRect(0, 14, 10, 6);
      g.fillRect(10, 14, 10, 6);
    });

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
    if (this.scene.textures.exists(key)) {
      this.scene.textures.remove(key);
    }
    const g = this.scene.add.graphics();
    draw(g);
    g.generateTexture(key, width, height);
    g.destroy();
  }
}
