import Phaser from "phaser";

export interface InputState {
  jump: boolean;
  duck: boolean;
  laneUp: boolean;
  laneDown: boolean;
}

export class InputManager {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey: Phaser.Input.Keyboard.Key;
  private lanesUnlocked = false;

  // Touch state
  private touchStartY = 0;
  private touchActive = false;
  private swipeDirection: "up" | "down" | null = null;
  private tapped = false;

  constructor(scene: Phaser.Scene) {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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
      scene.time.delayedCall(100, () => {
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

    if (this.tapped) this.tapped = false;

    return {
      jump,
      duck,
      laneUp: this.lanesUnlocked && (this.cursors.up.isDown || this.swipeDirection === "up"),
      laneDown: this.lanesUnlocked && (this.cursors.down.isDown || this.swipeDirection === "down"),
    };
  }

  isStartPressed(): boolean {
    const pressed = this.spaceKey.isDown || this.cursors.up.isDown || this.tapped;
    if (this.tapped) this.tapped = false;
    return pressed;
  }
}
