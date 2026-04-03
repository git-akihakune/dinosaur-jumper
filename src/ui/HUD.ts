import Phaser from "phaser";
import { CANVAS_WIDTH } from "../config/constants";

export class HUD {
  private scoreText: Phaser.GameObjects.Text;
  private hiScoreText: Phaser.GameObjects.Text;
  private powerUpText: Phaser.GameObjects.Text;
  private autoPlayText: Phaser.GameObjects.Text;
  private evolved = false;

  constructor(scene: Phaser.Scene) {
    this.hiScoreText = scene.add.text(CANVAS_WIDTH - 10, 10, "", {
      fontSize: "14px", color: "#888888", fontFamily: "monospace",
    }).setOrigin(1, 0).setDepth(10);

    this.scoreText = scene.add.text(CANVAS_WIDTH - 10, 28, "00000", {
      fontSize: "14px", color: "#535353", fontFamily: "monospace",
    }).setOrigin(1, 0).setDepth(10);

    this.powerUpText = scene.add.text(10, 10, "", {
      fontSize: "12px", color: "#4488ff", fontFamily: "monospace",
    }).setDepth(10).setVisible(false);

    this.autoPlayText = scene.add.text(10, 28, "", {
      fontSize: "12px", color: "#44ff44", fontFamily: "monospace",
    }).setDepth(10).setVisible(false);
  }

  update(score: number, hiScore: number, activePowerUps: {
    shield: boolean;
    magnetTime: number;
    autoPlayTime: number;
  }, autoPlayPermanent: boolean): void {
    this.scoreText.setText(String(Math.floor(score)).padStart(5, "0"));
    if (hiScore > 0) {
      this.hiScoreText.setText("HI " + String(hiScore).padStart(5, "0"));
    }

    const parts: string[] = [];
    if (activePowerUps.shield) parts.push("SHIELD");
    if (activePowerUps.magnetTime > 0) parts.push(`MAGNET ${Math.ceil(activePowerUps.magnetTime / 1000)}s`);
    if (activePowerUps.autoPlayTime > 0) parts.push(`AI ${Math.ceil(activePowerUps.autoPlayTime / 1000)}s`);

    if (parts.length > 0) {
      this.powerUpText.setText(parts.join(" | ")).setVisible(true);
    } else {
      this.powerUpText.setVisible(false);
    }

    if (autoPlayPermanent) {
      this.autoPlayText.setText("AUTO-PLAY [A]").setVisible(true);
    } else {
      this.autoPlayText.setVisible(false);
    }
  }

  evolve(progress: number): void {
    if (progress >= 1 && !this.evolved) {
      this.evolved = true;
      this.scoreText.setColor("#ffffff").setFontSize("16px").setStroke("#000000", 3);
      this.hiScoreText.setColor("#cccccc").setFontSize("14px").setStroke("#000000", 2);
    }
  }
}
