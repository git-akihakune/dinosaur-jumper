import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    this.add.text(200, 130, "Dinosaur Jumper", {
      fontSize: "32px",
      color: "#535353",
    });
  }
}
