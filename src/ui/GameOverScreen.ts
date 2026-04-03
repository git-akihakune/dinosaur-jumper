import Phaser from "phaser";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../config/constants";

export class GameOverScreen {
  private container: Phaser.GameObjects.Container;
  private scoreText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const messageText = scene.add.text(0, -20, "GAME OVER", {
      fontSize: "24px", color: "#535353", fontFamily: "monospace",
    }).setOrigin(0.5);

    this.scoreText = scene.add.text(0, 20, "", {
      fontSize: "14px", color: "#535353", fontFamily: "monospace",
    }).setOrigin(0.5);

    const restartText = scene.add.text(0, 50, "Press SPACE to restart", {
      fontSize: "12px", color: "#888888", fontFamily: "monospace",
    }).setOrigin(0.5);

    this.container = scene.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, [
      messageText, this.scoreText, restartText,
    ]);
    this.container.setDepth(10);
    this.container.setVisible(false);
  }

  show(score: number, isNewHiScore: boolean): void {
    this.scoreText.setText(
      `Score: ${Math.floor(score)}` + (isNewHiScore ? " NEW HI!" : "")
    );
    this.container.setVisible(true);
  }

  hide(): void {
    this.container.setVisible(false);
  }
}
