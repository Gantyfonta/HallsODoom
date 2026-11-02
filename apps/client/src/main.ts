import Phaser from "phaser";
import { BootScene } from "./render/BootScene";

/**
 * Entry point of the browser client.
 *
 * Phaser is used ONLY for drawing, input, and audio. All game rules live in
 * @hollow-crown/core, which knows nothing about Phaser.
 */
new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#0b0a0f",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 540,
  },
  scene: [BootScene],
});
