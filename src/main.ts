import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./config/constants";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: "#f7f7f7",
  scene: [GameScene],
  parent: document.body,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
